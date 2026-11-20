
require("dotenv").config();

const { ethers } = require("hardhat");
const deployment = require("../deployment/deployment-info.json");

const TOKEN_ADDRESS = deployment.contractAddress;
const RECIPIENT = "0x168d41368d532B082D5c44F4274A1d444B860e89";
const AMOUNT = "100";

async function main() {
  const [sender] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  if (network.chainId !== BigInt(deployment.chainId)) {
    throw new Error("Wrong network! Please use Sepolia.");
  }

  if (sender.address.toLowerCase() !== deployment.deployer.toLowerCase()) {
    throw new Error("Connected wallet is not the token deployer.");
  }

  if (!ethers.isAddress(RECIPIENT)) {
    throw new Error("Invalid recipient address.");
  }

  const code = await ethers.provider.getCode(TOKEN_ADDRESS);

  if (code === "0x") {
    throw new Error("Token contract not found on Sepolia.");
  }

  const token = await ethers.getContractAt(
    "Token42",
    TOKEN_ADDRESS,
    sender
  );

  const amount = ethers.parseUnits(
    AMOUNT,
    deployment.decimals
  );

  console.log("\n========== NJT TRANSFER ==========");
  console.log("Network: Ethereum Sepolia");
  console.log("Contract:", TOKEN_ADDRESS);
  console.log("Sender:", sender.address);
  console.log("Receiver:", RECIPIENT);
  console.log("Amount:", AMOUNT, deployment.tokenSymbol);
  console.log("----------------------------------");

  const senderBefore = await token.balanceOf(sender.address);
  const receiverBefore = await token.balanceOf(RECIPIENT);

  console.log(
    "Sender balance before:",
    ethers.formatUnits(senderBefore, deployment.decimals)
  );

  console.log(
    "Receiver balance before:",
    ethers.formatUnits(receiverBefore, deployment.decimals)
  );

  if (senderBefore < amount) {
    throw new Error("Insufficient token balance.");
  }

  console.log("\nSubmitting transfer...");

  const tx = await token.transfer(RECIPIENT, amount);

  console.log("Transaction submitted:", tx.hash);

  const receipt = await tx.wait(2);

  if (!receipt || receipt.status !== 1) {
    throw new Error("Transfer transaction failed.");
  }

  console.log("\nTransfer confirmed!");

  const senderAfter = await token.balanceOf(sender.address);
  const receiverAfter = await token.balanceOf(RECIPIENT);

  console.log("----------------------------------");
  console.log(
    "Sender balance after:",
    ethers.formatUnits(senderAfter, deployment.decimals)
  );

  console.log(
    "Receiver balance after:",
    ethers.formatUnits(receiverAfter, deployment.decimals)
  );

  console.log("----------------------------------");
  console.log("Transaction:", tx.hash);
  console.log(`Explorer: https://sepolia.etherscan.io/tx/${tx.hash}`);
  console.log("==================================\n");
}

main().catch((error) => {
  console.error("Transfer failed:", error);
  process.exitCode = 1;
});
