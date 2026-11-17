
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MultiSigWallet - 2 of 3", function () {
  async function deployFixture() {
    const [owner1, owner2, owner3, recipient, outsider] =
      await ethers.getSigners();

    const Token = await ethers.getContractFactory("Token42");
    const token = await Token.deploy();
    await token.waitForDeployment();

    const MultiSig = await ethers.getContractFactory("MultiSigWallet");
    const multisig = await MultiSig.deploy(
      [owner1.address, owner2.address, owner3.address],
      2
    );
    await multisig.waitForDeployment();

    // Fund the multisig wallet with 1,000 NJT.
    await token.transfer(
      await multisig.getAddress(),
      ethers.parseUnits("1000", 18)
    );

    return { owner1, owner2, owner3, recipient, outsider, token, multisig };
  }

  async function createProposal(multisig, owner, recipient, token, amount) {
    await multisig.connect(owner).submitTransaction(
      await token.getAddress(),
      recipient.address,
      amount
    );
  }

  it("sets 3 owners and requires 2 confirmations", async function () {
    const { owner1, owner2, owner3, multisig } = await deployFixture();

    expect(await multisig.getOwners()).to.deep.equal([
      owner1.address,
      owner2.address,
      owner3.address
    ]);

    expect(await multisig.requiredConfirmations()).to.equal(2);
  });

  it("rejects duplicate owners", async function () {
    const [owner1, owner2] = await ethers.getSigners();
    const MultiSig = await ethers.getContractFactory("MultiSigWallet");

    await expect(
      MultiSig.deploy([owner1.address, owner2.address, owner1.address], 2)
    ).to.be.revertedWith("Duplicate owner");
  });

  it("does not allow a non-owner to submit a transaction", async function () {
    const { outsider, recipient, token, multisig } = await deployFixture();

    await expect(
      multisig.connect(outsider).submitTransaction(
        await token.getAddress(),
        recipient.address,
        ethers.parseUnits("100", 18)
      )
    ).to.be.revertedWith("Not an owner");
  });

  it("does not allow a non-owner to confirm", async function () {
    const { owner1, outsider, recipient, token, multisig } =
      await deployFixture();

    await createProposal(
      multisig,
      owner1,
      recipient,
      token,
      ethers.parseUnits("100", 18)
    );

    await expect(
      multisig.connect(outsider).confirmTransaction(0)
    ).to.be.revertedWith("Not an owner");
  });

  it("rejects duplicate confirmation from the same owner", async function () {
    const { owner1, recipient, token, multisig } = await deployFixture();

    await createProposal(
      multisig,
      owner1,
      recipient,
      token,
      ethers.parseUnits("100", 18)
    );

    await multisig.connect(owner1).confirmTransaction(0);

    await expect(
      multisig.connect(owner1).confirmTransaction(0)
    ).to.be.revertedWith("Already confirmed");
  });

  it("cannot execute with only one confirmation", async function () {
    const { owner1, recipient, token, multisig } = await deployFixture();

    await createProposal(
      multisig,
      owner1,
      recipient,
      token,
      ethers.parseUnits("100", 18)
    );

    await multisig.connect(owner1).confirmTransaction(0);

    await expect(
      multisig.connect(owner1).executeTransaction(0)
    ).to.be.revertedWith("Not enough confirmations");

    expect(await token.balanceOf(recipient.address)).to.equal(0);
  });

  it("executes transfer after 2 different owners confirm", async function () {
    const { owner1, owner2, recipient, token, multisig } =
      await deployFixture();

    const amount = ethers.parseUnits("100", 18);

    await createProposal(multisig, owner1, recipient, token, amount);

    await multisig.connect(owner1).confirmTransaction(0);
    await multisig.connect(owner2).confirmTransaction(0);

    expect((await multisig.getTransaction(0)).confirmations).to.equal(2);

    await multisig.connect(owner1).executeTransaction(0);

    expect(await token.balanceOf(recipient.address)).to.equal(amount);
    expect(
      await token.balanceOf(await multisig.getAddress())
    ).to.equal(ethers.parseUnits("900", 18));

    expect((await multisig.getTransaction(0)).executed).to.equal(true);
  });

  it("does not execute the same transaction twice", async function () {
    const { owner1, owner2, recipient, token, multisig } =
      await deployFixture();

    await createProposal(
      multisig,
      owner1,
      recipient,
      token,
      ethers.parseUnits("100", 18)
    );

    await multisig.connect(owner1).confirmTransaction(0);
    await multisig.connect(owner2).confirmTransaction(0);
    await multisig.connect(owner1).executeTransaction(0);

    await expect(
      multisig.connect(owner2).executeTransaction(0)
    ).to.be.revertedWith("Transaction already executed");
  });

  it("rejects a transaction ID that does not exist", async function () {
    const { owner1, multisig } = await deployFixture();

    await expect(
      multisig.connect(owner1).confirmTransaction(99)
    ).to.be.revertedWith("Transaction does not exist");
  });
});
