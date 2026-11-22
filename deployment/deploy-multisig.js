
const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

const OWNERS = [
  "0xd05473d6e765C1b7824786eAa4388Dd8eb2d492C",
  "0x168d41368d532B082D5c44F4274A1d444B860e89",
  "0xcF3a8A3E151a925E4573A2Af3fd78Eaf7B4FfcCF"
];

const REQUIRED_CONFIRMATIONS = 2;

async function main() {
  if (network.name !== "sepolia") {
    throw new Error(`Wrong network: ${network.name}. Use --network sepolia`);
  }

  const [deployer] = await ethers.getSigners();

  console.log("Network:", network.name);
  console.log("Deployer:", deployer.address);
  console.log("Deploying MultiSigWallet...");

  const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");

  const multisig = await MultiSigWallet.deploy(
    OWNERS,
    REQUIRED_CONFIRMATIONS
  );

  const deploymentTx = multisig.deploymentTransaction();

  if (!deploymentTx) {
    throw new Error("Deployment transaction not found");
  }

  console.log("Transaction hash:", deploymentTx.hash);

  const receipt = await deploymentTx.wait(2);

  if (!receipt || receipt.status !== 1) {
    throw new Error("MultiSigWallet deployment transaction failed");
  }

  const multisigAddress = await multisig.getAddress();
  const deployedCode = await ethers.provider.getCode(multisigAddress);

  if (deployedCode === "0x") {
    throw new Error("MultiSigWallet bytecode not found on Sepolia");
  }

  const deploymentInfo = {
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    address: multisigAddress,
    deployer: deployer.address,
    owners: OWNERS,
    requiredConfirmations: REQUIRED_CONFIRMATIONS,
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    deployedAt: new Date().toISOString()
  };

  const deploymentDir = path.join(__dirname, "..", "deployment");
  const outputPath = path.join(deploymentDir, "multisig-deployment.json");

  fs.mkdirSync(deploymentDir, { recursive: true });

  fs.writeFileSync(
    outputPath,
    JSON.stringify(deploymentInfo, null, 2) + "\n"
  );

  console.log("\nMultiSigWallet deployed successfully!");
  console.log("Address:", multisigAddress);
  console.log("Owners:", OWNERS);
  console.log("Required confirmations:", REQUIRED_CONFIRMATIONS);
  console.log("Saved to:", outputPath);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
