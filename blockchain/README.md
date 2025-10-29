# Blockchain Setup - Prompt Economy

## Smart Contracts

This directory contains the Solidity smart contracts for the Prompt Economy platform.

### Iteration 1 Contracts

- **UserRegistry.sol**: Basic user registration and profile management on-chain

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with:
```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
POLYGON_MUMBAI_RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_wallet_private_key_here
```

## Development

### Compile Contracts
```bash
npm run compile
```

### Run Tests
```bash
npm test
```

### Start Local Hardhat Node
```bash
npm run node
```

### Deploy to Local Network
In a new terminal:
```bash
npm run deploy:local
```

### Deploy to Sepolia Testnet
```bash
npm run deploy:sepolia
```

## Contract Details

### UserRegistry

**Functions:**
- `registerUser(string username)`: Register a new user
- `updateUsername(string newUsername)`: Update username
- `getUser(address walletAddress)`: Get user details
- `isUsernameAvailable(string username)`: Check username availability
- `getTotalUsers()`: Get total registered users
- `getUserByUsername(string username)`: Find user by username

**Events:**
- `UserRegistered(address walletAddress, string username, uint256 timestamp)`
- `UsernameUpdated(address walletAddress, string oldUsername, string newUsername)`
- `ReputationUpdated(address walletAddress, uint256 newReputation)`

## Testing

Get test ETH for Sepolia:
- https://sepoliafaucet.com/
- https://faucet.quicknode.com/ethereum/sepolia

## Integration

After deployment, the contract address is automatically saved to:
`../frontend/src/contracts/contract-address.json`

Import and use in your React app:
```javascript
import contractAddress from './contracts/contract-address.json';
import UserRegistryArtifact from './contracts/UserRegistry.json';

const contract = new ethers.Contract(
  contractAddress.UserRegistry,
  UserRegistryArtifact.abi,
  signer
);
```
