#!/usr/bin/env node

const { execSync } = require('child_process');

console.log("🔍 Running Gadget API Queries\n");

// Get the playground URL from ggt status
const statusOutput = execSync('/Users/jarvis/Downloads/development/SOS/ggt+ status', { encoding: 'utf8' });
const playgroundMatch = statusOutput.match(/Playground\s+(.+)/);

if (playgroundMatch) {
  const playgroundUrl = playgroundMatch[1].trim();
  console.log("📊 Opening API Playground:", playgroundUrl);
  
  // Open the playground
  execSync(`open "${playgroundUrl}"`);
  
  console.log("\n📝 Copy and paste these queries into the playground:\n");
  
  const queries = `
// 1. Get all shops
const shops = await api.shopifyShop.findMany({
  select: {
    id: true,
    domain: true,
    name: true,
    currency: true
  }
});
console.log("Shops found:", shops.length);
console.table(shops);

// 2. Test getTodaysSales with first shop
if (shops.length > 0) {
  const shopId = shops[0].id;
  console.log("\\nTesting getTodaysSales for shop:", shopId);
  
  try {
    const result = await api.getTodaysSales({ shopId });
    console.log("Sales Result:", result);
    
    if (result.success && result.data) {
      console.log("Today's Orders:", result.data.orderCount);
      console.log("Total Sales:", result.data.currencyCode, "$" + result.data.totalSales);
      console.log("Top Products:", result.data.topProducts);
    }
  } catch (error) {
    console.error("API Error:", error.message);
  }
}

// 3. Get recent fraud checks
const fraudChecks = await api.fraudCheck.findMany({
  first: 5,
  sort: { createdAt: "Descending" },
  select: {
    id: true,
    orderId: true,
    riskScore: true,
    status: true,
    createdAt: true
  }
});
console.log("\\nRecent Fraud Checks:", fraudChecks.length);
console.table(fraudChecks);

// 4. Get dashboard stats
try {
  const stats = await api.getDashboardStats({});
  console.log("\\nDashboard Stats:", stats);
} catch (error) {
  console.error("Stats Error:", error.message);
}
`;

  console.log(queries);
  
  console.log("\n✅ The playground is now open in your browser");
  console.log("📋 Paste the queries above to test real store data");
  
} else {
  console.log("❌ Could not find playground URL");
  console.log("Run this from the Gadget app directory");
}