# Usage

1. Install Node.js 20+ and npm.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Set a Sepolia RPC URL and the private key of a dedicated test wallet.
5. Ensure the deployer wallet has SepoliaETH for transaction gas.

Compile and test:

```bash
npm run compile
npm test
```

Deploy:

```bash
npm run deploy:sepolia
```

Check the output for network `sepolia` and chain ID `11155111`. Open the printed contract address on https://sepolia.etherscan.io.

To import the token into MetaMask, select Sepolia, choose Import tokens, and paste the deployed contract address. To transfer NJT, call `transfer(recipientAddress, amount)`. The sender needs SepoliaETH for gas; a recipient does not pay gas to receive tokens.
