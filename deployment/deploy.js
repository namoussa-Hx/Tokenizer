
const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

const EXPECTED_CHAIN_ID = 11155111;
const MAX_RETRIES = 10;
const RETRY_DELAY = 3000;

async function retry(operation, label) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.log(
        `${label}: attempt ${attempt}/${MAX_RETRIES} failed`
      );

      if (attempt === MAX_RETRIES) {
        throw error;
      }

      await new Promise(resolve =>
        setTimeout(resolve, RETRY_DELAY)
      );
    }
  }
}

async function waitForContractCode(address) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const code = await retry(
      () => ethers.provider.getCode(address),
      "Checking contract bytecode"
    );

    if (code !== "0x") {
      return code;
    }

    console.log(
      `Contract code not visible yet (${attempt}/${MAX_RETRIES})`
    );

    await new Promise(resolve =>
      setTimeout(resolve, RETRY_DELAY)
    );
  }

  throw new Error(
    `Contract code not found at ${address}. Check the transaction on Etherscan.`
  );
}

async function main() {
  if (network.name !== "sepolia") {
    throw new Error(
      `Wrong network: ${network.name}. Use --network sepolia.`
    );
  }

  const chain = await ethers.provider.getNetwork();

  if (Number(chain.chainId) !== EXPECTED_CHAIN_ID) {
    throw new Error(`Wrong chain ID: ${chain.chainId}`);
  }

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("Network: Ethereum Sepolia");
  console.log("Chain ID:", chain.chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("SepoliaETH balance:", ethers.formatEther(balance));

  if (balance === 0n) {
    throw new Error("No SepoliaETH in deployer wallet.");
  }

  console.log("\nDeploying Token42...");

  const Factory = await ethers.getContractFactory("Token42");
  const token = await Factory.deploy();

  const tx = token.deploymentTransaction();

  if (!tx) {
    throw new Error("Deployment transaction was not created.");
  }

  const submittedAddress = await token.getAddress();

  console.log("\nDeployment transaction submitted!");
  console.log("Transaction:", tx.hash);
  console.log("Expected contract:", submittedAddress);
  console.log(
    "Transaction explorer:",
    `https://sepolia.etherscan.io/tx/${tx.hash}`
  );

  console.log("\nWaiting for 2 confirmations...");

  const receipt = await tx.wait(2);

  if (!receipt || receipt.status !== 1) {
    throw new Error(`Deployment failed. Transaction: ${tx.hash}`);
  }

  const address = receipt.contractAddress || submittedAddress;

  console.log("\nTransaction confirmed!");
  console.log("Contract address:", address);
  console.log("Block:", receipt.blockNumber);

  console.log("\nVerifying deployed bytecode...");

  await waitForContractCode(address);

  console.log("Contract bytecode verified!");

  const deployedToken = await ethers.getContractAt(
    "Token42",
    address
  );

  const tokenName = await retry(
    () => deployedToken.name(),
    "Reading token name"
  );

  const tokenSymbol = await retry(
    () => deployedToken.symbol(),
    "Reading token symbol"
  );

  const decimals = await retry(
    () => deployedToken.decimals(),
    "Reading decimals"
  );

  const totalSupply = await retry(
    () => deployedToken.totalSupply(),
    "Reading total supply"
  );

  const record = {
    network: "Ethereum Sepolia",
    chainId: EXPECTED_CHAIN_ID,
    tokenName,
    tokenSymbol,
    decimals: Number(decimals),
    totalSupply: ethers.formatUnits(totalSupply, decimals),
    deployer: deployer.address,
    contractAddress: address,
    transactionHash: tx.hash,
    blockNumber: receipt.blockNumber,
    explorerAddressUrl:
      `https://sepolia.etherscan.io/address/${address}`,
    explorerTransactionUrl:
      `https://sepolia.etherscan.io/tx/${tx.hash}`,
    deployedAt: new Date().toISOString()
  };

  const output = path.join(__dirname, "deployment-info.json");

  fs.writeFileSync(
    output,
    JSON.stringify(record, null, 2) + "\n"
  );

  console.log("\nDeployment successful!");
  console.log("Name:", tokenName);
  console.log("Symbol:", tokenSymbol);
  console.log("Decimals:", decimals.toString());
  console.log("Total supply:", record.totalSupply);
  console.log("Contract:", address);
  console.log("Transaction:", tx.hash);
  console.log("Explorer:", record.explorerAddressUrl);
  console.log("Saved:", output);
}

main().catch(error => {
  console.error("\nDeployment error:", error);
  process.exitCode = 1;
});
