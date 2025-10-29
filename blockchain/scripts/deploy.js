const hre = require("hardhat");

async function main() {
  console.log("Deploying UserRegistry contract...");

  // Get the contract factory
  const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");

  // Deploy the contract
  const userRegistry = await UserRegistry.deploy();

  // Wait for deployment to complete
  await userRegistry.waitForDeployment();

  const address = await userRegistry.getAddress();
  console.log("UserRegistry deployed to:", address);

  // Save the contract address for frontend use
  const fs = require("fs");
  const contractsDir = "../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ UserRegistry: address }, undefined, 2)
  );

  console.log("Contract address saved to frontend/src/contracts/contract-address.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
