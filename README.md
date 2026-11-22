# Tokenizer 42 — Ethereum Sepolia (ERC-20 + MultiSig)

An educational fixed-supply ERC-20 token developed for the 42 Tokenizer project, deployed on the Ethereum Sepolia test network.

The project also includes an additional 2-of-3 MultiSig wallet implementation as a bonus.

## Token Information

| Property | Value |
|---|---|
| Name | 42NajibToken |
| Symbol | NJT |
| Standard | ERC-20 |
| Network | Ethereum Sepolia |
| Chain ID | 11155111 |
| Decimals | 18 |
| Initial Supply | 1,000,000 NJT |
| Initial Holder | Deployer wallet |

The complete token supply is minted to the deployer during contract deployment. No additional tokens can be minted after deployment.

## Design Choices

We chose the ERC-20 standard because it is widely adopted,
well-documented, and supported by a mature Ethereum ecosystem.
It is also straightforward to develop, deploy, and test using
Hardhat and OpenZeppelin.

We chose Ethereum Sepolia because it provides a safe test
environment for deploying and testing smart contracts without
using real money. It also allows us to test our token using
Ethereum-compatible tools such as MetaMask and Etherscan.
## Technologies

- Solidity 0.8.24
- Hardhat
- JavaScript
- Ethers.js
- OpenZeppelin Contracts
- Ethereum Sepolia Testnet
- MetaMask
- Sepolia Etherscan

## Project Structure

```text
code/
  Token42.sol
  MultiSigWallet.sol

deployment/
  deploy.js
  deploy-multisig.js
  multisig-constructor-args.js

documentation/
  architecture.md
  multisig.md
  security.md
  tokenomics.md
  usage.md

scripts/
  check-balances.js
  transfer.js
  fund-multisig.js
  multisig-submit.js
  multisig-confirm.js
  multisig-execute.js

.env.example
.gitignore
hardhat.config.js
package.json
package-lock.json
README.md
```

After deploying Token42, the deployment script generates:

```text
deployment/deployment-info.json
```

This file contains the latest Token42 deployment information, including the contract address, transaction hash, network, token details, and deployer address. It is generated locally and is excluded from Git.

## Requirements

- Node.js 20 or later
- npm
- A MetaMask wallet
- SepoliaETH for deployment and transaction gas

## Installation

Clone the repository and install its dependencies:

```bash
git clone https://github.com/namoussa-Hx/Tokenizer.git
cd Tokenizer
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Configure `.env`:

```env
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

PRIVATE_KEY=YOUR_DEPLOYER_PRIVATE_KEY

OWNER2_PRIVATE_KEY=YOUR_SECOND_OWNER_PRIVATE_KEY
OWNER3_PRIVATE_KEY=YOUR_THIRD_OWNER_PRIVATE_KEY

ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

**Environment variables:**

- `SEPOLIA_RPC_URL`: RPC endpoint used to connect to Ethereum Sepolia.
- `PRIVATE_KEY`: Deployer wallet private key. Required for Token42 deployment and transfers.
- `OWNER2_PRIVATE_KEY` and `OWNER3_PRIVATE_KEY`: Additional owner accounts used by the MultiSig bonus.
- `ETHERSCAN_API_KEY`: Optional API key for Etherscan-related tooling.

Use dedicated test wallets. Never share or commit `.env`, private keys, or recovery phrases. Only `.env.example` should be committed.

The deployer wallet must have enough SepoliaETH to pay transaction gas.

## Compile

Compile the Solidity contracts:

```bash
npx hardhat compile
```

Hardhat uses the source directory configured in `hardhat.config.js`:

```js
sources: "./code"
```

Compiled artifacts and cache files are generated automatically.

## Deploy Token42

Make sure the deployer wallet has SepoliaETH, then run:

```bash
npx hardhat run deployment/deploy.js --network sepolia
```

The deployment script:

1. Connects to Ethereum Sepolia.
2. Checks the network and deployer balance.
3. Deploys the Token42 contract.
4. Waits for transaction confirmation.
5. Verifies that contract bytecode exists.
6. Reads the token information.
7. Saves the deployment information to `deployment/deployment-info.json`.

The generated JSON file contains the latest contract address and deployment transaction details.

**Latest deployment:**

- Network: Ethereum Sepolia
- Chain ID: `11155111`
- Contract address: `0xB4A4e44d41A21275aF368f8355362026C4397D2a`
- [View Token42 on Sepolia Etherscan](https://sepolia.etherscan.io/address/0xB4A4e44d41A21275aF368f8355362026C4397D2a)
- [View deployment transaction](https://sepolia.etherscan.io/tx/0xbf7a99733aa9b37e3795dc8ceb8b6aca666b63e0aade9b0acd67fdafb8c94460)

Every new deployment creates a new contract address. The deployment JSON is updated with the latest deployment information.

## Token Transfer

The transfer script reads the token address from `deployment/deployment-info.json`, so you do not need to manually change the contract address after deploying a new Token42 contract.

Run:

```bash
npx hardhat run scripts/transfer.js --network sepolia
```

The script:

1. Connects to the deployed Token42 contract.
2. Reads the sender and recipient balances.
3. Transfers the configured amount of NJT.
4. Waits for transaction confirmation.
5. Displays the updated balances and Etherscan transaction link.

The recipient address and transfer amount can be configured in `scripts/transfer.js`.

The sender needs SepoliaETH for gas. The recipient does not pay gas to receive tokens.

## Balance Verification

To check the NJT balances of the configured wallets, run:

```bash
npx hardhat run scripts/check-balances.js --network sepolia
```

The script reads the latest contract address from `deployment/deployment-info.json` and checks the balances of the configured accounts.

It displays:

- Network and contract address.
- Token name and symbol.
- Account 1 balance.
- Account 2 balance.
- Combined balance.

The combined balance can be compared with the total supply to verify that the token balances are correctly accounted for across the checked wallets.

## MetaMask Integration

To view NJT in MetaMask:

1. Select the Sepolia network.
2. Open **Manage tokens** or **Import tokens**.
3. Select **Add a custom token**.
4. Paste the deployed Token42 contract address from `deployment/deployment-info.json`.
5. Confirm the token information.

The token should appear as NJT in your wallet.

Each wallet displays its own NJT balance. Switching MetaMask accounts changes the balance displayed for that account.

## Etherscan Verification

Sepolia Etherscan provides public access to the deployed contract and its transactions.

Use the contract address to inspect:

- Contract creation transaction.
- Contract source code and bytecode.
- Contract interactions.
- ERC-20 token transfers.
- Transaction status and details.

[Open Sepolia Etherscan](https://sepolia.etherscan.io)

## MultiSig Wallet Bonus

The project also includes a 2-of-3 MultiSig wallet implementation.

The wallet has three owners and requires at least two confirmations before a submitted transaction can be executed.

### Features

- Exactly three owners.
- Duplicate and zero-address owners are rejected.
- Only owners can submit, confirm, and execute transactions.
- Each owner can confirm a transaction only once.
- Execution requires at least two confirmations.
- Executed transactions cannot be executed again.
- ERC-20 transfers use OpenZeppelin SafeERC20.

### Existing MultiSig Deployment

- Network: Ethereum Sepolia
- Chain ID: `11155111`
- Contract address: `0x1e5B02563E5758D4153272F4dBb1f29F87761433`
- [View MultiSig on Etherscan](https://sepolia.etherscan.io/address/0x1e5B02563E5758D4153272F4dBb1f29F87761433)

See `documentation/multisig.md` for its architecture and usage.

### Deploy a New MultiSig Wallet

Configure the three owner addresses in `deployment/deploy-multisig.js`, then run:

```bash
npx hardhat run deployment/deploy-multisig.js --network sepolia
```

This deploys a new MultiSig wallet. It does not redeploy Token42.

### MultiSig Interaction Scripts

The project includes scripts for interacting with the MultiSig wallet:

**Fund the MultiSig wallet:**

```bash
npx hardhat run scripts/fund-multisig.js --network sepolia
```

**Submit a transaction and provide the first confirmation:**

```bash
npx hardhat run scripts/multisig-submit.js --network sepolia
```

**Confirm using Account 2:**

```bash
OWNER_INDEX=1 TX_ID=0 npx hardhat run scripts/multisig-confirm.js --network sepolia
```

**Confirm using Account 3:**

```bash
OWNER_INDEX=2 TX_ID=0 npx hardhat run scripts/multisig-confirm.js --network sepolia
```

**Execute an approved transaction:**

```bash
TX_ID=0 npx hardhat run scripts/multisig-execute.js --network sepolia
```

Replace transaction IDs when necessary. Check the wallet state before repeating funding or transaction submission commands.

## Security Considerations

- Use dedicated test wallets.
- Never share private keys or recovery phrases.
- Keep `.env` out of version control.
- The Token42 supply is fixed after deployment.
- OpenZeppelin provides the ERC-20 implementation.
- The MultiSig demonstration uses three owner accounts controlled by the same user. It demonstrates the 2-of-3 mechanism but does not provide independent security identities.
- This educational project is not a production security audit.

SepoliaETH and NJT on Sepolia are test assets and have no promised real-world monetary value.

## Documentation

Additional project documentation:

- `documentation/architecture.md` — Project architecture and deployment flow.
- `documentation/tokenomics.md` — Token supply and economic properties.
- `documentation/security.md` — Security considerations and limitations.
- `documentation/usage.md` — Installation, deployment, and token usage.
- `documentation/multisig.md` — MultiSig architecture and usage.

