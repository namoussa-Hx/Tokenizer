const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  if (network.name !== "sepolia") {
    throw new Error(`Wrong network: ${network.name}. Use --network sepolia.`);
  }

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("Network:", network.name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("SepoliaETH balance:", ethers.formatEther(balance));

  if (balance === 0n) {
    throw new Error("No SepoliaETH in deployer wallet. Fund it with test ETH first.");
  }

  const Factory = await ethers.getContractFactory("Token42");
  const token = await Factory.deploy();
  await token.waitForDeployment();

  const address = await token.getAddress();
  const tx = token.deploymentTransaction();
  const record = {
    network: "Ethereum Sepolia",
    chainId: 11155111,
    tokenName: await token.name(),
    tokenSymbol: await token.symbol(),
    decimals: Number(await token.decimals()),
    totalSupply: ethers.formatUnits(await token.totalSupply(), 18),
    deployer: deployer.address,
    contractAddress: address,
    transactionHash: tx ? tx.hash : null,
    explorerAddressUrl: `https://sepolia.etherscan.io/address/${address}`,
    explorerTransactionUrl: tx ? `https://sepolia.etherscan.io/tx/${tx.hash}` : null,
    deployedAt: new Date().toISOString()
  };

  const output = path.join(__dirname, "deployment-info.json");
  fs.writeFileSync(output, JSON.stringify(record, null, 2) + "\n");

  console.log("\nDeployment successful!");
  console.log("Contract:", address);
  console.log("Transaction:", record.transactionHash);
  console.log("Explorer:", record.explorerAddressUrl);
  console.log("Saved:", output);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
