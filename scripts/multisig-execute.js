
const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function readDeployment(fileName) {
  const filePath = path.join(__dirname, "../deployment", fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`${fileName} not found. Deploy the contract first.`);
  }

  const deployment = JSON.parse(
    fs.readFileSync(filePath, "utf8")
  );

  if (
    !deployment.contractAddress ||
    !ethers.isAddress(deployment.contractAddress)
  ) {
    throw new Error(`Invalid contract address in ${fileName}.`);
  }

  return deployment.contractAddress;
}

async function main() {
  if (network.name !== "sepolia") {
    throw new Error("Wrong network. Use Sepolia.");
  }

  const chain = await ethers.provider.getNetwork();

  if (chain.chainId !== 11155111n) {
    throw new Error("Wrong chain ID. Expected Ethereum Sepolia.");
  }

  // Read contract addresses dynamically
  const TOKEN_ADDRESS = await readDeployment("deployment-info.json");

  const MULTISIG_ADDRESS = await readDeployment("multisig-deployment-info.json");

  // Get executor
  const ownerIndex = Number(process.env.OWNER_INDEX ?? 0);
  const txId = BigInt(process.env.TX_ID ?? 0);

  const signers = await ethers.getSigners();

  if (
    !Number.isInteger(ownerIndex) ||
    ownerIndex < 0 ||
    ownerIndex >= signers.length
  ) {
    throw new Error("Invalid OWNER_INDEX.");
  }

  if (txId < 0n) {
    throw new Error("Invalid TX_ID.");
  }

  const executor = signers[ownerIndex];

  const multisig = await ethers.getContractAt(
    "MultiSigWallet",
    MULTISIG_ADDRESS,
    executor
  );

  console.log("Token42:", TOKEN_ADDRESS);
  console.log("MultiSig:", MULTISIG_ADDRESS);
  console.log("Executor:", executor.address);
  console.log("Transaction ID:", txId.toString());

  // Verify deployed contracts
  const tokenCode = await ethers.provider.getCode(TOKEN_ADDRESS);
  const multisigCode = await ethers.provider.getCode(MULTISIG_ADDRESS);

  if (tokenCode === "0x") {
    throw new Error("Token42 is not deployed at this address.");
  }

  if (multisigCode === "0x") {
    throw new Error("MultiSig is not deployed at this address.");
  }

  // Verify executor is an owner
  if (!(await multisig.isOwner(executor.address))) {
    throw new Error("Executor is not a MultiSig owner.");
  }

  // Read proposal
  const transaction = await multisig.getTransaction(txId);

  if (ethers.getAddress(transaction.token) !== ethers.getAddress(TOKEN_ADDRESS)) {
    throw new Error("Proposal does not reference the current Token42 deployment.");
  }

  if (transaction.executed) {
    throw new Error("Transaction already executed.");
  }

  // Check confirmation threshold
  const required = await multisig.requiredConfirmations();

  if (transaction.confirmations < required) {
    throw new Error("Not enough confirmations.");
  }

  // Execute proposal
  const tx = await multisig.executeTransaction(txId);

  console.log("Execution submitted:", tx.hash);

  await tx.wait();

  console.log("\nTransaction executed successfully!");

  const updated = await multisig.getTransaction(txId);

  console.log("Executed:", updated.executed);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
