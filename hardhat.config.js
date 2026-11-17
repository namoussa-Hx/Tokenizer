
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

function getPrivateKey(name) {
  const key = process.env[name];

  if (!key) return null;

  return key.startsWith("0x") ? key : `0x${key}`;
}

const accounts = [
  getPrivateKey("PRIVATE_KEY"),
  getPrivateKey("OWNER2_PRIVATE_KEY"),
  getPrivateKey("OWNER3_PRIVATE_KEY")
].filter(Boolean);

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },

  paths: {
    sources: "./code",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },

  networks: {
    hardhat: {},

    sepolia: {
      url:
        process.env.SEPOLIA_RPC_URL ||
        "https://ethereum-sepolia-rpc.publicnode.com",
      chainId: 11155111,
      accounts
    }
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || ""
  }
};
