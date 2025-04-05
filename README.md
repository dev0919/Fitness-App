# FITCOIN Token and Blockchain API

This project implements an ERC-20 token called FITCOIN (FIT) for the FitConnect fitness app, deployed on the Polygon Mumbai Testnet. It also provides a REST API to interact with the token.

## Token Details

- **Name**: FITCOIN
- **Symbol**: FIT
- **Total Supply**: 1,000,000 tokens
- **Decimals**: 18
- **Network**: Polygon Mumbai Testnet

## Setup

1. Configure your environment variables in the `.env` file:

```
# Blockchain configuration (Polygon Mumbai Testnet)
PRIVATE_KEY=your_private_key_here
RPC_URL=https://rpc-mumbai.maticvigil.com
TOKEN_ADDRESS=your_token_contract_address_after_deployment
```

2. Install dependencies:

```bash
npm install
```

## Deploying the Token

To deploy the FITCOIN token to the Polygon Mumbai Testnet:

```bash
npx hardhat run deploy-token.js --network mumbai
```

This will:
- Deploy the FITCOIN ERC-20 token contract
- Log the contract address (save this as TOKEN_ADDRESS in your .env file)
- Mint 1,000,000 tokens to the deployer's wallet

## API Endpoints

### GET /api/blockchain/info

Get information about the FITCOIN token.

**Response:**
```json
{
  "name": "FITCOIN",
  "symbol": "FIT",
  "decimals": 18,
  "totalSupply": "1000000.0",
  "serviceWalletAddress": "0x..."
}
```

### POST /api/blockchain/reward

Send FITCOIN tokens to a user as a reward.

**Request Body:**
```json
{
  "userId": 1,
  "amount": 10,
  "reason": "Completed workout"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tokens rewarded successfully",
  "userId": 1,
  "amount": 10,
  "reason": "Completed workout",
  "newBalance": "110.0"
}
```

### POST /api/blockchain/transfer

Transfer FITCOIN tokens from the service wallet to an external wallet.

**Request Body:**
```json
{
  "wallet": "0x...",
  "amount": 10
}
```

**Response:**
```json
{
  "message": "Token transfer successful",
  "transaction": {
    "success": true,
    "transactionHash": "0x...",
    "blockNumber": 12345678
  },
  "amount": "10.0",
  "recipient": "0x...",
  "newBalance": "20.0"
}
```

## Testing

You can test the API endpoints using tools like Postman or curl:

```bash
# Get token info
curl http://localhost:5000/api/blockchain/info

# Reward tokens to a user
curl -X POST http://localhost:5000/api/blockchain/reward \
  -H "Content-Type: application/json" \
  -d '{"userId": 1, "amount": 10, "reason": "Completed workout"}'

# Transfer tokens to an external wallet
curl -X POST http://localhost:5000/api/blockchain/transfer \
  -H "Content-Type: application/json" \
  -d '{"wallet": "0x123...", "amount": 10}'
```