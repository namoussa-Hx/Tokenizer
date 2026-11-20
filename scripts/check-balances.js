
require("dotenv").config();

const { ethers } = require("hardhat");
const deployment = require("../deployment/deployment-info.json");

const TOKEN_ADDRESS = deployment.contractAddress;

const ACCOUNT_1 = "0xd05473d6e765C1b7824786eAa4388Dd8eb2d492C";
const ACCOUNT_2 = "0x168d41368d532B082D5c44F4274A1d444B860e89";

async function main() {
  const provider = ethers.provider;
  const network = await provider.getNetwork();

  if (network.chainId !== BigInt(deployment.chainId)) {
    throw new Error("Wrong network! Please use Sepolia.");
  }

  const code = await provider.getCode(TOKEN_ADDRESS);

  if (code === "0x") {
    throw new Error(
      `Token contract not found at ${TOKEN_ADDRESS}`
    );
  }

  const token = new ethers.Contract(
    TOKEN_ADDRESS,
    ["function balanceOf(address) view returns (uint256)"],
    provider
  );

  const balance1 = await token.balanceOf(ACCOUNT_1);
  const balance2 = await token.balanceOf(ACCOUNT_2);

  console.log("\n========== NJT BALANCE CHECK ==========");
  console.log("Network: Ethereum Sepolia");
  console.log("Contract:", TOKEN_ADDRESS);
  console.log("Token:", deployment.tokenName, `(${deployment.tokenSymbol})`);
  console.log("---------------------------------------");
  console.log("Account 1:", ethers.formatUnits(balance1, deployment.decimals), "NJT");
  console.log("Account 2:", ethers.formatUnits(balance2, deployment.decimals), "NJT");
  console.log("---------------------------------------");
  console.log(
    "Combined balance:",
    ethers.formatUnits(balance1 + balance2, deployment.decimals),
    "NJT"
  );
  console.log("=======================================\n");
}

main().catch((error) => {
  console.error("Balance check failed:", error.message);
  process.exitCode = 1;
});
