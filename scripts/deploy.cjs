// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
const hre = require("hardhat");

async function main() {
  // Compile contracts
  await hre.run('compile');
  
  // Get the contract factory
  const RewardStore = await hre.ethers.getContractFactory("RewardStore");
  
  // Deploy the contract
  console.log("Deploying RewardStore...");
  const rewardStore = await RewardStore.deploy();
  
  // Wait for deployment to finish
  await rewardStore.deployed();
  
  console.log("RewardStore deployed to:", rewardStore.address);
  
  // Update this address in your frontend service
  console.log("\nUpdate the REWARD_STORE_CONTRACT_ADDRESS in your RewardContractService.ts file with this address.");
  console.log(`Use: const REWARD_STORE_CONTRACT_ADDRESS = "${rewardStore.address}";`);
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });