
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
    throw new Error("Wrong chain ID.");
  }

  // Read contract addresses dynamically
  const TOKEN_ADDRESS = await readDeployment("deployment-info.json");
  const MULTISIG_ADDRESS = await readDeployment("multisig-deployment-info.json");

  const [signer] = await ethers.getSigners();

  // Verify contracts are deployed
  const tokenCode = await ethers.provider.getCode(TOKEN_ADDRESS);
  const multisigCode = await ethers.provider.getCode(MULTISIG_ADDRESS);

  if (tokenCode === "0x") {
    throw new Error("Token42 is not deployed at this address.");
  }

  if (multisigCode === "0x") {
    throw new Error("MultiSigWallet is not deployed at this address.");
  }

  const token = await ethers.getContractAt(
    "Token42",
    TOKEN_ADDRESS,
    signer
  );

  const amount = ethers.parseUnits("1000", 18);

  const balance = await token.balanceOf(signer.address);

  if (balance < amount) {
    throw new Error("Insufficient NJT balance.");
  }

  console.log("Token42:", TOKEN_ADDRESS);
  console.log("Sender:", signer.address);
  console.log("MultiSig:", MULTISIG_ADDRESS);
  console.log("Sending: 1000 NJT");

  const tx = await token.transfer(MULTISIG_ADDRESS, amount);

  console.log("Transaction:", tx.hash);

  await tx.wait();

  console.log("\nTransfer confirmed!");

  const multisigBalance = await token.balanceOf(MULTISIG_ADDRESS);

  console.log(
    "MultiSig NJT balance:",
    ethers.formatUnits(multisigBalance, 18)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
