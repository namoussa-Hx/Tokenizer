
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

  // Get first signer (Owner 1)
  const [owner1] = await ethers.getSigners();

  const multisig = await ethers.getContractAt(
    "MultiSigWallet",
    MULTISIG_ADDRESS,
    owner1
  );

  console.log("Token42:", TOKEN_ADDRESS);
  console.log("MultiSig:", MULTISIG_ADDRESS);
  console.log("Owner 1:", owner1.address);

  // Verify owner
  if (!(await multisig.isOwner(owner1.address))) {
    throw new Error("Signer is not a MultiSig owner.");
  }

  // Verify deployed contracts
  const tokenCode = await ethers.provider.getCode(TOKEN_ADDRESS);
  const multisigCode = await ethers.provider.getCode(MULTISIG_ADDRESS);

  if (tokenCode === "0x") {
    throw new Error("Token42 contract is not deployed at this address.");
  }

  if (multisigCode === "0x") {
    throw new Error("MultiSig contract is not deployed at this address.");
  }

  const amount = ethers.parseUnits("100", 18);

  // Submit transaction
  const submitTx = await multisig.submitTransaction(
    TOKEN_ADDRESS,
    "0x168d41368d532B082D5c44F4274A1d444B860e89",
    amount
  );

  console.log("Submission transaction:", submitTx.hash);

  await submitTx.wait();

  const txId = (await multisig.getTransactionCount()) - 1n;

  console.log("\nTransaction submitted!");
  console.log("Transaction ID:", txId.toString());
  console.log("Recipient:", "0x168d41368d532B082D5c44F4274A1d444B860e89");
  console.log("Amount: 100 NJT");

  // Owner 1 gives the first confirmation
  const confirmTx = await multisig.confirmTransaction(txId);

  console.log("Confirmation transaction:", confirmTx.hash);

  await confirmTx.wait();

  const transaction = await multisig.getTransaction(txId);

  console.log("\nOwner 1 confirmed!");
  console.log(
    "Confirmations:",
    transaction.confirmations.toString()
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
