
const { ethers, network } = require("hardhat");

const MULTISIG_ADDRESS =
  "0x1e5B02563E5758D4153272F4dBb1f29F87761433";

const TOKEN_ADDRESS =
  "0xFf04B981E6857CD8B336203caF13b4cF63cd6703";

const ACCOUNT_2 =
  "0x168d41368d532B082D5c44F4274A1d444B860e89";

async function main() {
  if (network.name !== "sepolia") {
    throw new Error("Wrong network.");
  }

  const [owner1] = await ethers.getSigners();

  const multisig = await ethers.getContractAt(
    "MultiSigWallet",
    MULTISIG_ADDRESS,
    owner1
  );

  const amount = ethers.parseUnits("100", 18);

  // Submit transaction
  const submitTx = await multisig.submitTransaction(
    TOKEN_ADDRESS,
    ACCOUNT_2,
    amount
  );

  await submitTx.wait();

  const txId = (await multisig.getTransactionCount()) - 1n;

  console.log("Transaction submitted!");
  console.log("Transaction ID:", txId.toString());
  console.log("Recipient:", ACCOUNT_2);
  console.log("Amount: 100 NJT");

  // Owner 1 gives the first confirmation
  const confirmTx = await multisig.confirmTransaction(txId);
  await confirmTx.wait();

  const transaction = await multisig.getTransaction(txId);

  console.log("\nOwner 1 confirmed!");
  console.log(
    "Confirmations:",
    transaction.confirmations.toString()
  );
  console.log(
    "Required:",
    (await multisig.requiredConfirmations()).toString()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
