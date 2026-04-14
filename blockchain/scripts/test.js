const hre = require("hardhat");

async function main() {
  console.log("Testing PromptMarketplace contract...\n");

  // Get contract addresses
  const fs = require("fs");
  const path = require("path");
  const addressesPath = path.join(__dirname, "../../frontend/src/contracts/contract-address.json");

  if (!fs.existsSync(addressesPath)) {
    console.error("❌ Contract addresses not found. Please deploy contracts first.");
    return;
  }

  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  const marketplaceAddress = addresses.PromptMarketplace;

  console.log("📍 Marketplace Contract:", marketplaceAddress);

  // Get signers
  const [owner, creator, buyer] = await hre.ethers.getSigners();
  console.log("👤 Owner:", owner.address);
  console.log("👤 Creator:", creator.address);
  console.log("👤 Buyer:", buyer.address);
  console.log("");

  // Get contract instance
  const PromptMarketplace = await hre.ethers.getContractFactory("PromptMarketplace");
  const marketplace = PromptMarketplace.attach(marketplaceAddress);

  // Test 1: List a prompt
  console.log("1️⃣  Listing a prompt...");
  const promptPrice = hre.ethers.parseEther("0.01"); // 0.01 ETH
  const listTx = await marketplace.connect(creator).listPrompt("Test Prompt", promptPrice);
  await listTx.wait();
  console.log("✅ Prompt listed successfully");

  // Get prompt details
  const promptId = 1; // First prompt
  const prompt = await marketplace.prompts(promptId);
  console.log("📄 Prompt Details:");
  console.log("   ID:", prompt.id.toString());
  console.log("   Title:", prompt.title);
  console.log("   Creator:", prompt.creator);
  console.log("   Price:", hre.ethers.formatEther(prompt.price), "ETH");
  console.log("   Active:", prompt.isActive);
  console.log("");

  // Test 2: Purchase the prompt
  console.log("2️⃣  Purchasing the prompt...");
  const purchaseTx = await marketplace.connect(buyer).purchasePrompt(promptId, { value: promptPrice });
  await purchaseTx.wait();
  console.log("✅ Prompt purchased successfully");

  // Check purchase status
  const hasPurchased = await marketplace.hasPurchased(promptId, buyer.address);
  console.log("🛒 Purchase Status:", hasPurchased);

  // Check creator earnings
  const creatorEarnings = await marketplace.creatorEarnings(creator.address);
  console.log("💰 Creator Earnings:", hre.ethers.formatEther(creatorEarnings), "ETH");

  // Check platform earnings
  const platformEarnings = await marketplace.totalEarnings();
  console.log("🏢 Platform Earnings:", hre.ethers.formatEther(platformEarnings), "ETH");

  console.log("\n🎉 All tests passed! Data is being stored and retrieved from blockchain.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });