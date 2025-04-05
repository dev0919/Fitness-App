require('dotenv').config();
const hre = require("hardhat");

async function main() {
  // Get the deployer's address
  const [deployer] = await ethers.getSigners();
  console.log("Deploying FITCOIN with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploy the FITCOIN contract
  const FITCOIN = await hre.ethers.getContractFactory("FITCOIN");
  const fitcoin = await FITCOIN.deploy(deployer.address);

  await fitcoin.deployed();

  console.log("FITCOIN deployed to:", fitcoin.address);
  console.log(`Contract Address: ${fitcoin.address}`);
  console.log("Add this address to your .env file as TOKEN_ADDRESS");
  
  const totalSupply = await fitcoin.totalSupply();
  console.log("Total supply:", ethers.utils.formatUnits(totalSupply, 18));
  
  const name = await fitcoin.name();
  const symbol = await fitcoin.symbol();
  console.log(`Token Name: ${name}`);
  console.log(`Token Symbol: ${symbol}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });