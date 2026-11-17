
require("dotenv").config();
const { ethers } = require("hardhat");

const TOKEN_ADDRESS = "0xFf04B981E6857CD8B336203caF13b4cF63cd6703";

const ACCOUNT_1 = "0xd05473d6e765C1b7824786eAa4388Dd8eb2d492C";
const ACCOUNT_2 = "0x168d41368d532B082D5c44F4274A1d444B860e89";

async function main() {
  const provider = ethers.provider;

  const network = await provider.getNetwork();

  if (network.chainId !== 11155111n) {
    throw new Error("Wrong network! Please use Sepolia.");
  }

  const token = new ethers.Contract(
    TOKEN_ADDRESS,
    ["function balanceOf(address) view returns (uint256)"],
    provider
  );

  const code = await provider.getCode(TOKEN_ADDRESS);

  if (code === "0x") {
    throw new Error("Token contract not found on Sepolia.");
  }

  const balance1 = await token.balanceOf(ACCOUNT_1);
  const balance2 = await token.balanceOf(ACCOUNT_2);

  console.log("\n========== NJT BALANCE CHECK ==========");
  console.log("Network: Ethereum Sepolia");
  console.log("Token: 42NajibToken (NJT)");
  console.log("---------------------------------------");
  console.log("Account 1:", ethers.formatEther(balance1), "NJT");
  console.log("Account 2:", ethers.formatEther(balance2), "NJT");
  console.log("---------------------------------------");
  console.log(
    "Total:",
    ethers.formatEther(balance1 + balance2),
    "NJT"
  );
  console.log("=======================================\n");
}

main().catch((error) => {
  console.error("Balance check failed:", error.message);
  process.exitCode = 1;
});
