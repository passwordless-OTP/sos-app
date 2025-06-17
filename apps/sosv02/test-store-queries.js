const { api } = require("./.gadget/client");

async function testStoreQueries() {
  console.log("🔍 Testing Store Data Queries\n");
  
  try {
    // 1. Test shop data
    console.log("1️⃣ Fetching Shop Information:");
    const shops = await api.shopifyShop.findMany({ first: 5 });
    console.log(`   Found ${shops.length} shops`);
    
    if (shops.length > 0) {
      const shop = shops[0];
      console.log(`   Shop: ${shop.domain}`);
      console.log(`   ID: ${shop.id}`);
      console.log(`   Currency: ${shop.currency}`);
      console.log(`   Timezone: ${shop.timezone}\n`);
      
      // 2. Test getTodaysSales action
      console.log("2️⃣ Testing getTodaysSales Action:");
      try {
        const salesResult = await api.getTodaysSales({ shopId: shop.id });
        console.log("   Success:", salesResult.success);
        if (salesResult.data) {
          console.log(`   Date: ${salesResult.data.date}`);
          console.log(`   Orders: ${salesResult.data.orderCount}`);
          console.log(`   Total: ${salesResult.data.currencyCode} $${salesResult.data.totalSales}`);
          console.log(`   Top Products:`, salesResult.data.topProducts);
        }
      } catch (error) {
        console.log("   ❌ Error:", error.message);
      }
      
      // 3. Check fraud checks
      console.log("\n3️⃣ Checking Fraud Check Data:");
      const fraudChecks = await api.fraudCheck.findMany({ 
        first: 5,
        sort: { createdAt: "Descending" }
      });
      console.log(`   Found ${fraudChecks.length} fraud checks`);
      
      // 4. Check network intelligence
      console.log("\n4️⃣ Checking Network Intelligence:");
      const networkData = await api.NetworkIntelligence.findMany({ first: 5 });
      console.log(`   Found ${networkData.length} network intelligence records`);
      
      // 5. Get dashboard stats
      console.log("\n5️⃣ Testing getDashboardStats Action:");
      try {
        const stats = await api.getDashboardStats({ shopDomain: shop.domain });
        console.log("   Stats:", stats.stats);
        console.log(`   Recent checks: ${stats.recentChecks.length}`);
      } catch (error) {
        console.log("   ❌ Error:", error.message);
      }
      
    } else {
      console.log("   ❌ No shops found in database");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

testStoreQueries();