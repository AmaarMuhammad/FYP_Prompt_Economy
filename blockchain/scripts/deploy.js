const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...\n");

  // Deploy UserRegistry
  console.log("1. Deploying UserRegistry contract...");
  const UserRegistry = await hre.ethers.getContractFactory("UserRegistry");
  const userRegistry = await UserRegistry.deploy();
  await userRegistry.waitForDeployment();
  const userRegistryAddress = await userRegistry.getAddress();
  console.log("✅ UserRegistry deployed to:", userRegistryAddress);

  // Deploy PromptMarketplace
  console.log("\n2. Deploying PromptMarketplace contract...");
  const PromptMarketplace = await hre.ethers.getContractFactory("PromptMarketplace");
  const promptMarketplace = await PromptMarketplace.deploy();
  await promptMarketplace.waitForDeployment();
  const promptMarketplaceAddress = await promptMarketplace.getAddress();
  console.log("✅ PromptMarketplace deployed to:", promptMarketplaceAddress);

  // Save the contract addresses for frontend use
  const fs = require("fs");
  const contractsDir = "../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  const addresses = {
    UserRegistry: userRegistryAddress,
    PromptMarketplace: promptMarketplaceAddress
  };

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify(addresses, undefined, 2)
  );

  console.log("\n✅ Contract addresses saved to frontend/src/contracts/contract-address.json");
  
  console.log("\n📝 Contract Addresses Summary:");
  console.log("================================");
  console.log("UserRegistry:       ", userRegistryAddress);
  console.log("PromptMarketplace:  ", promptMarketplaceAddress);
  console.log("================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
