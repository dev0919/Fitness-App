const hre = require("hardhat");

async function main() {
  // Get the deployer's address
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy the FITCOIN contract
  const FITCOIN = await hre.ethers.getContractFactory("FITCOIN");
  const fitcoin = await FITCOIN.deploy(deployer.address);

  await fitcoin.deployed();

  console.log("FITCOIN deployed to:", fitcoin.address);
  console.log("Total supply:", await fitcoin.totalSupply());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
