
# MultiSig Wallet Bonus

## Overview

This project includes a 2-of-3 MultiSig wallet
implemented in Solidity.

The wallet has three owners and requires at least
two different owners to approve a transaction
before it can be executed.

## Network

- Network: Ethereum Sepolia
- Chain ID: 11155111
- Contract: MultiSigWallet

## Owners

1. 0xd05473d6e765C1b7824786eAa4388Dd8eb2d492C
2. 0x168d41368d532B082D5c44F4274A1d444B860e89
3. 0xcF3a8A3E151a925E4573A2Af3fd78Eaf7B4FfcCF

Required confirmations: 2

## Contract Address

0x1e5B02563E5758D4153272F4dBb1f29F87761433

Explorer:
https://sepolia.etherscan.io/address/0x1e5B02563E5758D4153272F4dBb1f29F87761433

## How It Works

1. An owner submits an ERC-20 transfer proposal.
2. Owners confirm the proposal independently.
3. The contract counts unique confirmations.
4. Once two confirmations are collected,
   any owner can execute the transaction.
5. The wallet transfers tokens to the recipient.

## Security Features

- Exactly three owners.
- Duplicate owners are rejected.
- Zero addresses are rejected.
- Only owners can submit, confirm and execute.
- An owner cannot confirm the same transaction twice.
- Transactions require the configured threshold.
- Executed transactions cannot be executed again.
- SafeERC20 is used for token transfers.
- The executed state is updated before the external token call.

## Testing

Run the complete test suite:

```bash
npm test
```

The project currently has 14 passing tests:
- 9 MultiSigWallet tests
- 5 Token42 tests

## Interaction Scripts

- `scripts/fund-multisig.js`
- `scripts/multisig-submit.js`
- `scripts/multisig-confirm.js`
- `scripts/multisig-execute.js`

## Important Security Note

The three owner accounts used in this educational
demonstration are controlled by the same user's
wallet recovery phrase. They demonstrate the
2-of-3 mechanism but are not independent security
identities for production use.
