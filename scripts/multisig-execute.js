
const { ethers, network } = require("hardhat");

const MULTISIG_ADDRESS =
  "0x1e5B02563E5758D4153272F4dBb1f29F87761433";

async function main() {
  if (network.name !== "sepolia") {
    throw new Error("Wrong network.");
  }

  const txId = Number(process.env.TX_ID ?? 0);
  const [executor] = await ethers.getSigners();

  const multisig = await ethers.getContractAt(
    "MultiSigWallet",
    MULTISIG_ADDRESS,
    executor
  );

  console.log("Executor:", executor.address);
  console.log("Transaction ID:", txId);

  const transaction = await multisig.getTransaction(txId);

  if (transaction.executed) {
    throw new Error("Transaction already executed.");
  }

  const required = await multisig.requiredConfirmations();

  if (transaction.confirmations < required) {
    throw new Error("Not enough confirmations.");
  }

  const tx = await multisig.executeTransaction(txId);

  console.log("Execution submitted:", tx.hash);

  await tx.wait();

  console.log("Transaction executed successfully!");

  const updated = await multisig.getTransaction(txId);

  console.log("Executed:", updated.executed);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
