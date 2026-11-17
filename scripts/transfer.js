
require("dotenv").config();
const { ethers } = require("hardhat");

const TOKEN_ADDRESS = "0xFf04B981E6857CD8B336203caF13b4cF63cd6703";
const RECIPIENT = "0x168d41368d532B082D5c44F4274A1d444B860e89";
const AMOUNT = "100";

async function main() {
  const [sender] = await ethers.getSigners();

  const token = await ethers.getContractAt(
    "Token42",
    TOKEN_ADDRESS,
    sender
  );

  console.log("Sender:", sender.address);
  console.log("Receiver:", RECIPIENT);

  const senderBefore = await token.balanceOf(sender.address);
  const receiverBefore = await token.balanceOf(RECIPIENT);

  console.log("Sender balance before:", ethers.formatEther(senderBefore));
  console.log("Receiver balance before:", ethers.formatEther(receiverBefore));

  const tx = await token.transfer(
    RECIPIENT,
    ethers.parseUnits(AMOUNT, 18)
  );

  console.log("Transaction submitted:", tx.hash);

  await tx.wait();

  console.log("Transaction confirmed!");

  const senderAfter = await token.balanceOf(sender.address);
  const receiverAfter = await token.balanceOf(RECIPIENT);

  console.log("Sender balance after:", ethers.formatEther(senderAfter));
  console.log("Receiver balance after:", ethers.formatEther(receiverAfter));
  console.log("Explorer:", `https://sepolia.etherscan.io/tx/${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
