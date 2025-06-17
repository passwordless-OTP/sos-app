// First, let's check what's in the .gadget/client directory
const fs = require('fs');
const path = require('path');

console.log("🔍 Checking Gadget Client Setup\n");

// Check if .gadget/client exists
const clientPath = path.join(__dirname, '.gadget', 'client');
if (fs.existsSync(clientPath)) {
  console.log("✅ .gadget/client directory exists");
  
  // List files
  const files = fs.readdirSync(clientPath);
  console.log("Files in .gadget/client:");
  files.forEach(file => console.log(`   - ${file}`));
  
  // Try to import the client
  try {
    const { Client } = require("./.gadget/client");
    console.log("\n✅ Client imported successfully");
    
    // Create API instance
    const api = new Client({
      environment: "development"
    });
    
    console.log("✅ API client created");
    
    // Test a simple query
    testQueries(api);
    
  } catch (error) {
    console.log("\n❌ Error importing client:", error.message);
  }
} else {
  console.log("❌ .gadget/client directory not found");
  console.log("   Run 'ggt dev' to generate the client");
}

async function testQueries(api) {
  console.log("\n📊 Running Test Queries:\n");
  
  try {
    // 1. List shops
    console.log("1️⃣ Fetching shops...");
    const shops = await api.shopifyShop.findMany({ 
      first: 1,
      select: {
        id: true,
        domain: true,
        currency: true,
        name: true
      }
    });
    
    if (shops && shops.length > 0) {
      const shop = shops[0];
      console.log(`   ✅ Found shop: ${shop.domain || shop.name}`);
      console.log(`   ID: ${shop.id}`);
      console.log(`   Currency: ${shop.currency || 'USD'}`);
      
      // 2. Test getTodaysSales
      console.log("\n2️⃣ Testing getTodaysSales action...");
      try {
        const result = await api.getTodaysSales({ shopId: shop.id });
        console.log("   ✅ Action executed successfully");
        console.log(`   Result:`, JSON.stringify(result, null, 2));
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
      
    } else {
      console.log("   ❌ No shops found");
    }
    
  } catch (error) {
    console.log("❌ Query error:", error.message);
    console.log("   Make sure you're logged in to Gadget");
  }
}