require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-verify");
const path = require("path");

// Ensures variables are loaded from the root .env file
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    },
    polygon_mumbai: {
      url: process.env.POLYGON_MUMBAI_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 80001
    }
  },

  // Simplified for Etherscan V2 (Unified Multichain API)
  etherscan: {
    // In 2026, V2 works best with a single string instead of a nested object
    apiKey: process.env.ETHERSCAN_API_KEY
  },

  // Optional: Disables the Sourcify warning message in your terminal
  sourcify: {
    enabled: false 
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};