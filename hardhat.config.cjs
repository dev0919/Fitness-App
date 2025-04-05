/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  // Default network when executing hardhat commands
  defaultNetwork: "hardhat",
  
  // Network configurations
  networks: {
    // Hardhat network for local development
    hardhat: {
      chainId: 31337
    },
    // Mumbai testnet (Polygon) - To use this, uncomment and add your API key and private key
    /*
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 80001
    },
    // Polygon mainnet - To use this, uncomment and add your API key and private key
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 137
    }
    */
  },
  
  // Solidity compiler configuration
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  
  // Paths configuration
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  
  // Mocha configuration for testing
  mocha: {
    timeout: 40000
  }
};