
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

  // Read MultiSig address dynamically
  const MULTISIG_ADDRESS = await readDeployment("multisig-deployment-info.json");

  // Transaction ID and owner index
  const txId = Number(process.env.TX_ID ?? 0);
  const ownerIndex = Number(process.env.OWNER_INDEX ?? 1);

  const signers = await ethers.getSigners();

  if (
    !Number.isInteger(ownerIndex) ||
    ownerIndex < 0 ||
    ownerIndex >= signers.length
  ) {
    throw new Error("Invalid OWNER_INDEX.");
  }

  const owner = signers[ownerIndex];

  const multisig = await ethers.getContractAt(
    "MultiSigWallet",
    MULTISIG_ADDRESS,
    owner
  );

  console.log("MultiSig:", MULTISIG_ADDRESS);
  console.log("Owner:", owner.address);
  console.log("Transaction ID:", txId);

  // Verify deployed contract
  const multisigCode = await ethers.provider.getCode(MULTISIG_ADDRESS);

  if (multisigCode === "0x") {
    throw new Error("MultiSig contract is not deployed at this address.");
  }

  // Verify owner
  if (!(await multisig.isOwner(owner.address))) {
    throw new Error("Not a MultiSig owner.");
  }

  const transaction = await multisig.getTransaction(txId);

  if (transaction.executed) {
    throw new Error("Transaction already executed.");
  }

  if (await multisig.isConfirmed(txId, owner.address)) {
    throw new Error("Already confirmed by this owner.");
  }

  // Submit confirmation
  const tx = await multisig.confirmTransaction(txId);

  console.log("Confirmation submitted:", tx.hash);

  await tx.wait();

  const updated = await multisig.getTransaction(txId);

  console.log("\nConfirmation successful!");
  console.log(
    "Confirmations:",
    updated.confirmations.toString()
  );
  console.log(
    "Required:",
    (await multisig.requiredConfirmations()).toString()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
