
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
    throw new Error("Wrong network. Use --network sepolia.");
  }

  const chain = await ethers.provider.getNetwork();

  if (chain.chainId !== 11155111n) {
    throw new Error("Wrong chain ID. Expected Ethereum Sepolia.");
  }

  const [deployer] = await ethers.getSigners();

  console.log("Network: Ethereum Sepolia");
  console.log("Deployer:", deployer.address);
  console.log("Owners:", OWNERS);
  console.log("Required confirmations:", REQUIRED_CONFIRMATIONS);

  const Factory = await ethers.getContractFactory("MultiSigWallet");
  const multisig = await Factory.deploy(
    OWNERS,
    REQUIRED_CONFIRMATIONS
  );

  await multisig.waitForDeployment();

  const address = await multisig.getAddress();
  const tx = multisig.deploymentTransaction();

  const record = {
    network: "Ethereum Sepolia",
    chainId: 11155111,
    contractName: "MultiSigWallet",
    contractAddress: address,
    owners: OWNERS,
    requiredConfirmations: REQUIRED_CONFIRMATIONS,
    deployer: deployer.address,
    transactionHash: tx ? tx.hash : null,
    explorerUrl: `https://sepolia.etherscan.io/address/${address}`,
    deployedAt: new Date().toISOString()
  };

  const output = path.join(
    __dirname,
    "multisig-deployment-info.json"
  );

  fs.writeFileSync(output, JSON.stringify(record, null, 2) + "\n");

  console.log("\nMultisig deployment successful!");
  console.log("Contract:", address);
  console.log("Transaction:", record.transactionHash);
  console.log("Explorer:", record.explorerUrl);
  console.log("Saved:", output);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
