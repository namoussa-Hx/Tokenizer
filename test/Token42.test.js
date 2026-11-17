const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token42", function () {
  async function deployToken() {
    const [owner, recipient, spender] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("Token42");
    const token = await Factory.deploy();
    await token.waitForDeployment();
    return { token, owner, recipient, spender };
  }

  it("has the expected name, symbol and decimals", async function () {
    const { token } = await deployToken();
    expect(await token.name()).to.equal("42NajibToken");
    expect(await token.symbol()).to.equal("NJT");
    expect(await token.decimals()).to.equal(18);
  });

  it("mints the fixed initial supply to the deployer", async function () {
    const { token, owner } = await deployToken();
    const supply = ethers.parseUnits("1000000", 18);
    expect(await token.totalSupply()).to.equal(supply);
    expect(await token.balanceOf(owner.address)).to.equal(supply);
  });

  it("transfers tokens between wallets", async function () {
    const { token, owner, recipient } = await deployToken();
    await token.transfer(recipient.address, ethers.parseUnits("100", 18));
    expect(await token.balanceOf(recipient.address)).to.equal(ethers.parseUnits("100", 18));
    expect(await token.balanceOf(owner.address)).to.equal(ethers.parseUnits("999900", 18));
  });

  it("supports approve and transferFrom", async function () {
    const { token, owner, recipient, spender } = await deployToken();
    await token.approve(spender.address, ethers.parseUnits("50", 18));
    expect(await token.allowance(owner.address, spender.address)).to.equal(ethers.parseUnits("50", 18));
    await token.connect(spender).transferFrom(owner.address, recipient.address, ethers.parseUnits("20", 18));
    expect(await token.balanceOf(recipient.address)).to.equal(ethers.parseUnits("20", 18));
    expect(await token.allowance(owner.address, spender.address)).to.equal(ethers.parseUnits("30", 18));
  });

  it("rejects a transfer when the sender has insufficient balance", async function () {
    const { token, recipient } = await deployToken();
    await expect(
      token.connect(recipient).transfer("0x000000000000000000000000000000000000dEaD", 1)
    ).to.be.reverted;
  });
});
