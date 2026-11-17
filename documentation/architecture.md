# Architecture

1. The test wallet's private key is stored securely in `.env`.
2. Hardhat compiles Solidity, runs tests, and signs deployment transactions.
3. The Sepolia RPC endpoint relays JSON-RPC requests to Ethereum Sepolia.
4. Ethereum Sepolia executes and stores the Token42 contract state.
5. Sepolia Etherscan displays the public contract and transaction history.
6. MetaMask can be used to view the wallet and interact with the deployed token.

During deployment, Hardhat loads the contract factory, signs the transaction using the test wallet configured in `.env`, and broadcasts it through the RPC endpoint. Once included in a block, the contract is available at its new address.

For a transfer, a holder signs `transfer(recipient, amount)`. The contract updates balances and the network records the transaction.

Network: Ethereum Sepolia. Chain ID: 11155111. Explorer: https://sepolia.etherscan.io
