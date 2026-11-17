
const { ethers, network } = require("hardhat");

const TOKEN_ADDRESS =
  "0xFf04B981E6857CD8B336203caF13b4cF63cd6703";

const MULTISIG_ADDRESS =
  "0x1e5B02563E5758D4153272F4dBb1f29F87761433";

async function main() {
  if (network.name !== "sepolia") {
    throw new Error("Wrong network. Use Sepolia.");
  }

  const chain = await ethers.provider.getNetwork();

  if (chain.chainId !== 11155111n) {
    throw new Error("Wrong chain ID.");
  }

  const [signer] = await ethers.getSigners();

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
