import { ethers } from "hardhat";

async function main() {
  // Get the contract factory
  const Voting = await ethers.getContractFactory("Voting");
  
  // Deploy the contract
  const voting = await Voting.deploy();
  
  // Wait for the deployment to be mined
  await voting.waitForDeployment();
  
  console.log("Voting contract deployed to:", await voting.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });