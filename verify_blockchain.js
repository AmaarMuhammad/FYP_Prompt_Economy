/**
 * Blockchain Verification Script
 * Run this to verify blockchain data storage
 */

require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Purchase = require('./backend/models/Purchase.model');
const Prompt = require('./backend/models/Prompt.model');
const User = require('./backend/models/User.model');
const { ethers } = require('ethers');

async function verifyBlockchainData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // 1. Check all purchases with blockchain info
    console.log('=== PURCHASE VERIFICATION ===');
    const purchases = await Purchase.find()
      .populate('buyer', 'username walletAddress')
      .populate('prompt', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    purchases.forEach((purchase, index) => {
      console.log(`\n${index + 1}. Purchase ID: ${purchase._id}`);
      console.log(`   Buyer: ${purchase.buyer?.username} (${purchase.buyerWallet})`);
      console.log(`   Prompt: ${purchase.prompt?.title}`);
      console.log(`   Transaction Hash: ${purchase.transactionHash}`);
      console.log(`   Block Number: ${purchase.blockNumber || 'N/A'}`);
      console.log(`   Blockchain Verified: ${purchase.blockchainVerified}`);
      console.log(`   Status: ${purchase.status}`);
      console.log(`   Access Granted: ${purchase.accessGranted}`);
      console.log(`   Created: ${purchase.createdAt}`);
    });

    // 2. Check prompts with blockchain IDs
    console.log('\n\n=== PROMPT BLOCKCHAIN INFO ===');
    const prompts = await Prompt.find({ blockchainId: { $exists: true } })
      .populate('creator', 'username walletAddress')
      .sort({ createdAt: -1 })
      .limit(5);

    prompts.forEach((prompt, index) => {
      console.log(`\n${index + 1}. Prompt: ${prompt.title}`);
      console.log(`   Blockchain ID: ${prompt.blockchainId || 'Not set'}`);
      console.log(`   Transaction Hash: ${prompt.transactionHash || 'Not set'}`);
      console.log(`   Creator: ${prompt.creatorWallet}`);
      console.log(`   Price: ${ethers.formatEther(prompt.price)} MATIC`);
    });

    // 3. Stats
    console.log('\n\n=== STATISTICS ===');
    const totalPurchases = await Purchase.countDocuments();
    const verifiedPurchases = await Purchase.countDocuments({ blockchainVerified: true });
    const demoPurchases = await Purchase.countDocuments({ transactionHash: /^demo-tx-/ });
    const completedPurchases = await Purchase.countDocuments({ status: 'completed' });

    console.log(`Total Purchases: ${totalPurchases}`);
    console.log(`Blockchain Verified: ${verifiedPurchases}`);
    console.log(`Demo Transactions: ${demoPurchases}`);
    console.log(`Completed Purchases: ${completedPurchases}`);
    console.log(`Access Granted: ${await Purchase.countDocuments({ accessGranted: true })}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

async function verifyOnChain(transactionHash) {
  try {
    console.log('\n=== ON-CHAIN VERIFICATION ===');
    
    // Connect to Polygon Mumbai testnet
    const provider = new ethers.JsonRpcProvider(
      process.env.POLYGON_MUMBAI_RPC || 'https://rpc-mumbai.maticvigil.com'
    );

    console.log(`Checking transaction: ${transactionHash}`);

    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(transactionHash);

    if (!receipt) {
      console.log('❌ Transaction not found on blockchain');
      return false;
    }

    console.log('\n✅ Transaction Found:');
    console.log(`   Block Number: ${receipt.blockNumber}`);
    console.log(`   Status: ${receipt.status === 1 ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   From: ${receipt.from}`);
    console.log(`   To: ${receipt.to}`);
    console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
    console.log(`   Block Hash: ${receipt.blockHash}`);

    // Get transaction details
    const tx = await provider.getTransaction(transactionHash);
    if (tx) {
      console.log(`\n📝 Transaction Details:`);
      console.log(`   Value: ${ethers.formatEther(tx.value)} MATIC`);
      console.log(`   Gas Price: ${ethers.formatUnits(tx.gasPrice, 'gwei')} gwei`);
      console.log(`   Nonce: ${tx.nonce}`);
    }

    return receipt.status === 1;

  } catch (error) {
    console.error('❌ On-chain verification error:', error.message);
    return false;
  }
}

// Run verification
const args = process.argv.slice(2);

if (args[0] === 'onchain' && args[1]) {
  // Verify specific transaction on blockchain
  verifyOnChain(args[1]).then(() => process.exit(0));
} else {
  // Verify database records
  verifyBlockchainData().then(() => process.exit(0));
}
