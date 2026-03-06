/**
 * Check Platform Fee Calculations
 */

require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');
const Purchase = require('./backend/models/Purchase.model');
const { ethers } = require('ethers');

async function checkFees() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const purchases = await Purchase.find()
      .populate('buyer', 'username')
      .populate('prompt', 'title')
      .sort({ createdAt: -1 });

    console.log('=== PLATFORM FEE CALCULATIONS ===\n');

    purchases.forEach((purchase, index) => {
      const priceWei = BigInt(purchase.price);
      const platformFeeWei = BigInt(purchase.platformFee);
      const creatorEarningWei = BigInt(purchase.creatorEarning);

      const priceMatic = ethers.formatEther(priceWei);
      const platformFeeMatic = ethers.formatEther(platformFeeWei);
      const creatorEarningMatic = ethers.formatEther(creatorEarningWei);

      // Calculate percentages
      const platformFeePercent = priceWei > 0n 
        ? Number((platformFeeWei * 10000n) / priceWei) / 100 
        : 0;
      const creatorPercent = priceWei > 0n 
        ? Number((creatorEarningWei * 10000n) / priceWei) / 100 
        : 0;

      console.log(`${index + 1}. Purchase: ${purchase.prompt?.title || 'N/A'}`);
      console.log(`   Buyer: ${purchase.buyer?.username || 'Unknown'}`);
      console.log(`   Price:              ${priceMatic} MATIC`);
      console.log(`   Platform Fee (5%):  ${platformFeeMatic} MATIC (${platformFeePercent.toFixed(2)}%)`);
      console.log(`   Creator Earning:    ${creatorEarningMatic} MATIC (${creatorPercent.toFixed(2)}%)`);
      console.log(`   Status: ${purchase.status}`);
      console.log('');
    });

    // Summary
    const totalRevenue = purchases.reduce((sum, p) => sum + BigInt(p.price), 0n);
    const totalPlatformFees = purchases.reduce((sum, p) => sum + BigInt(p.platformFee), 0n);
    const totalCreatorEarnings = purchases.reduce((sum, p) => sum + BigInt(p.creatorEarning), 0n);

    console.log('=== TOTALS ===');
    console.log(`Total Revenue:          ${ethers.formatEther(totalRevenue)} MATIC`);
    console.log(`Total Platform Fees:    ${ethers.formatEther(totalPlatformFees)} MATIC`);
    console.log(`Total Creator Earnings: ${ethers.formatEther(totalCreatorEarnings)} MATIC`);
    
    if (totalRevenue > 0n) {
      const avgPlatformPercent = Number((totalPlatformFees * 10000n) / totalRevenue) / 100;
      console.log(`Average Platform Fee:   ${avgPlatformPercent.toFixed(2)}%`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

checkFees().then(() => process.exit(0));
