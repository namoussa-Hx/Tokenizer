
const { ethers, network } = require("hardhat");

const MULTISIG_ADDRESS =
  "0x1e5B02563E5758D4153272F4dBb1f29F87761433";

async function main() {
  if (network.name !== "sepolia") {
    throw new Error("Wrong network.");
  }

  const txId = Number(process.env.TX_ID ?? 0);
  const ownerIndex = Number(process.env.OWNER_INDEX ?? 1);

  const signers = await ethers.getSigners();

  if (!Number.isInteger(ownerIndex) ||
      ownerIndex < 0 ||
      ownerIndex >= signers.length) {
    throw new Error("Invalid OWNER_INDEX.");
  }

  const owner = signers[ownerIndex];

  const multisig = await ethers.getContractAt(
    "MultiSigWallet",
    MULTISIG_ADDRESS,
    owner
  );

  console.log("Owner:", owner.address);
  console.log("Transaction ID:", txId);

  if (!(await multisig.isOwner(owner.address))) {
    throw new Error("Not a multisig owner.");
  }

  const transaction = await multisig.getTransaction(txId);

  if (transaction.executed) {
    throw new Error("Transaction already executed.");
  }

  if (await multisig.isConfirmed(txId, owner.address)) {
    throw new Error("Already confirmed by this owner.");
  }

  const tx = await multisig.confirmTransaction(txId);

  console.log("Confirmation submitted:", tx.hash);

  await tx.wait();

  const updated = await multisig.getTransaction(txId);

  console.log("Confirmation successful!");
  console.log(
    "Confirmations:",
    updated.confirmations.toString()
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
