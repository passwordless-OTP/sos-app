// Test authenticated API access from Node.js
const { Client } = require("@gadget-client/sosv02");

async function testWithAPIKey() {
  console.log("🔑 Testing Gadget API with authentication\n");
  
  // Option 1: Using API Key (you need to create one in Gadget settings)
  const apiKeyClient = new Client({
    apiKey: process.env.GADGET_API_KEY // Set this in your environment
  });
  
  try {
    console.log("Testing with API Key...");
    const shops = await apiKeyClient.shopifyShop.findMany({ first: 1 });
    console.log("✅ Shops found:", shops.length);
    
    if (shops.length > 0) {
      const result = await apiKeyClient.getTodaysSales({ shopId: shops[0].id });
      console.log("✅ Sales data:", result);
    }
  } catch (error) {
    console.log("❌ API Key error:", error.message);
  }
}

async function testWithSessionToken() {
  console.log("\n🔐 For Shopify embedded app context:\n");
  
  console.log(`
  // In your React component (already authenticated via Shopify):
  import { api } from "../api";
  
  const result = await api.getTodaysSales({ shopId });
  console.log(result);
  `);
}

// Instructions
console.log("📋 AUTHENTICATION STEPS:\n");
console.log("1. Create an API key:");
console.log("   - Go to: https://sosv02.gadget.app/edit/development/settings/api-keys");
console.log("   - Click 'Create API key'");
console.log("   - Copy the key\n");
console.log("2. Set environment variable:");
console.log("   export GADGET_API_KEY='your-key-here'\n");
console.log("3. Run this script again\n");

// Check if API key is set
if (process.env.GADGET_API_KEY) {
  testWithAPIKey();
} else {
  console.log("⚠️  No GADGET_API_KEY environment variable found");
}

testWithSessionToken();