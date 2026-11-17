# Tokenizer 42 — Ethereum Sepolia (ERC-20)

Educational fixed-supply ERC-20 token for the 42 Tokenizer project.

- Name: 42NajibToken
- Symbol: NJT
- Standard: ERC-20
- Network: Ethereum Sepolia
- Chain ID: 11155111
- Decimals: 18
- Initial supply: 1,000,000 NJT
- Initial holder: deployer wallet

## Setup

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env
```

Edit `.env`:

```env
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=your_private_key_without_0x
ETHERSCAN_API_KEY=
```

Use a dedicated test wallet. Never share or commit `.env`, your private key, or recovery phrase.
## Deployment Information

The deployed contract is verified on Ethereum Sepolia.

- Contract: [42NajibToken](https://sepolia.etherscan.io/address/0xFf04B981E6857CD8B336203caF13b4cF63cd6703)
- Deployment transaction: [View transaction](https://sepolia.etherscan.io/tx/0x6a92889500b94ac9729f83ccad958dbe9c392b0f725d4ea9d6c1816632fbc63)
- Token transfer test: [View 100 NJT transfer](https://sepolia.etherscan.io/tx/0xffbb91554c131e7c5e418b33306015e45f8224b7aa286f902043bc2f6801fadb)

See `deployment/deployment-info.json` for the deployment record.
## Compile and test locally

```bash
npm run compile
npm test
```

Tests run on Hardhat's local network and do not spend SepoliaETH.

## Deploy to Sepolia

Make sure the deployer wallet has SepoliaETH, then run:

```bash
npm run deploy:sepolia
```

The script prints the contract address and transaction hash and writes `deployment/deployment-info.json`.

Explorer: https://sepolia.etherscan.io/address/0xFf04B981E6857CD8B336203caF13b4cF63cd6703

## Optional verification

Add an Etherscan API key to `.env`, then:

```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
```

## Structure

```text
code/Token42.sol
deployment/deploy.js
deployment/deployment-info.md
documentation/architecture.md
documentation/security.md
documentation/tokenomics.md
documentation/usage.md
test/Token42.test.js
.env.example
.gitignore
hardhat.config.js
package.json
README.md
```

SepoliaETH and NJT deployed on Sepolia are test assets, not real-money assets.