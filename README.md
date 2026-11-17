# Tokenizer 42 — Ethereum Sepolia (ERC-20 + MultiSig)

Educational fixed-supply ERC-20 token developed for the 42 Tokenizer project, with an additional 2-of-3 MultiSig wallet bonus.

## Token Information

- Name: 42NajibToken
- Symbol: NJT
- Standard: ERC-20
- Network: Ethereum Sepolia
- Chain ID: 11155111
- Decimals: 18
- Initial supply: 1,000,000 NJT
- Initial holder: deployer wallet

## MultiSig Bonus

The project includes a MultiSig wallet with three owners and a two-confirmation threshold (2-of-3).

Features:
- Exactly three owners.
- Duplicate and zero-address owners are rejected.
- Only owners can submit, confirm, and execute transactions.
- Each owner can confirm a transaction only once.
- Execution requires at least two confirmations.
- Executed transactions cannot be executed again.
- ERC-20 transfers use OpenZeppelin SafeERC20.

### MultiSig Deployment

- Network: Ethereum Sepolia
- Chain ID: 11155111
- Contract: `0x1e5B02563E5758D4153272F4dBb1f29F87761433`
- [View MultiSig on Etherscan](https://sepolia.etherscan.io/address/0x1e5B02563E5758D4153272F4dBb1f29F87761433)

See `deployment/multisig-deployment-info.json` for the deployment record and `documentation/multisig.md` for the architecture and usage.

## Setup

Requirements: Node.js 20+ and npm.

```bash
npm install
cp .env.example .env
```

Configure `.env` with your own Sepolia test accounts:

```env
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

PRIVATE_KEY=YOUR_ACCOUNT_1_PRIVATE_KEY
OWNER2_PRIVATE_KEY=YOUR_ACCOUNT_2_PRIVATE_KEY
OWNER3_PRIVATE_KEY=YOUR_ACCOUNT_3_PRIVATE_KEY

ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
```

Use dedicated test wallets. Never share or commit `.env`, private keys, or recovery phrases.

Each owner needs SepoliaETH to submit transactions and confirmations.

## Compile and Test

```bash
npm run compile
npm test
```

Tests run on Hardhat's local network and do not spend SepoliaETH.

The current test suite contains 14 tests:
- 5 Token42 tests.
- 9 MultiSigWallet tests.

## Deploy Token42

Make sure the deployer wallet has SepoliaETH, then run:

```bash
npm run deploy:sepolia
```

The script writes `deployment/deployment-info.json`.

Token contract:
[42NajibToken on Etherscan](https://sepolia.etherscan.io/address/0xFf04B981E6857CD8B336203caF13b4cF63cd6703)

## Deploy MultiSigWallet

The deployed MultiSig wallet is already available on Sepolia.

For a new deployment, configure the three owner addresses in `deployment/deploy-multisig.js`, then run:

```bash
npx hardhat run deployment/deploy-multisig.js --network sepolia
```

This creates a new wallet contract. It does not redeploy Token42.

## MultiSig Interaction

The following scripts interact with the deployed MultiSig wallet:

```bash
# Fund the MultiSig wallet (initial funding only)
npx hardhat run scripts/fund-multisig.js --network sepolia

# Submit a transaction and give the first confirmation
npx hardhat run scripts/multisig-submit.js --network sepolia

# Confirm using Account 2
OWNER_INDEX=1 TX_ID=0 npx hardhat run scripts/multisig-confirm.js --network sepolia

# Confirm using Account 3
OWNER_INDEX=2 TX_ID=0 npx hardhat run scripts/multisig-confirm.js --network sepolia

# Execute an approved transaction
TX_ID=0 npx hardhat run scripts/multisig-execute.js --network sepolia
```

Replace transaction IDs as needed. Do not repeat funding or submission commands without checking the current wallet state.

## Token Deployment Information

- Token deployment transaction:
  [View deployment](https://sepolia.etherscan.io/tx/0x6a92889500b94ac9729f83ccad958dbe9c392b0f725d4ea9d6c1816632fbc63)

- Test transfer transaction:
  [View 100 NJT transfer](https://sepolia.etherscan.io/tx/0xffbb91554c131e7c5e418b33306015e45f8224b7aa286f902043bc2f6801fadb)

See `deployment/deployment-info.json` for the token deployment record.

## Project Structure

```text
code/
  Token42.sol
  MultiSigWallet.sol

deployment/
  deploy.js
  deploy-multisig.js
  deployment-info.json
  deployment-info.md
  multisig-deployment-info.json
  multisig-constructor-args.js

documentation/
  architecture.md
  security.md
  tokenomics.md
  usage.md
  multisig.md

scripts/
  check-balances.js
  transfer.js
  fund-multisig.js
  multisig-submit.js
  multisig-confirm.js
  multisig-execute.js

test/
  Token42.test.js
  MultiSigWallet.test.js

.env.example
.gitignore
hardhat.config.js
package.json
package-lock.json
README.md
```

## Security Note

The three owner accounts used in this educational demonstration are controlled by the same user's wallet recovery phrase. They demonstrate the 2-of-3 mechanism but do not provide independent security identities for production use.

SepoliaETH and NJT deployed on Sepolia are test assets, not real-money assets.