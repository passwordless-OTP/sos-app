#!/usr/bin/env node

/**
 * Test script for SOS Fraud Detection Integration
 * Run: node sos.test.fraud-integration.[VERIFICATION].js
 */

const axios = require('axios');

const LOOKUP_SERVICE_URL = process.env.LOOKUP_SERVICE_URL || 'http://localhost:3001';

// Test data
const testCases = [
  {
    name: "Test IP - Google DNS",
    data: { identifier: "8.8.8.8", type: "ip" }
  },
  {
    name: "Test IP - Known VPN",
    data: { identifier: "104.238.186.189", type: "ip" }
  },
  {
    name: "Test Email - Valid",
    data: { identifier: "test@gmail.com", type: "email" }
  },
  {
    name: "Test Email - Suspicious",
    data: { identifier: "temp123@mailinator.com", type: "email" }
  },
  {
    name: "Test Phone - US Number",
    data: { identifier: "+14155552671", type: "phone" }
  }
];

async function runTests() {
  console.log('🔍 SOS Fraud Detection Integration Test\n');
  console.log(`Testing service at: ${LOOKUP_SERVICE_URL}\n`);

  // First check if service is running
  try {
    await axios.get(`${LOOKUP_SERVICE_URL}/health`);
    console.log('✅ Lookup service is running\n');
  } catch (error) {
    console.error('❌ Lookup service is not running!');
    console.error('Please start it with: cd services/lookup-aggregator && npm start\n');
    process.exit(1);
  }

  // Run test cases
  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}`);
    console.log(`Testing: ${testCase.data.identifier}`);
    
    try {
      const startTime = Date.now();
      const response = await axios.post(`${LOOKUP_SERVICE_URL}/api/lookup`, testCase.data);
      const duration = Date.now() - startTime;
      
      const result = response.data;
      
      console.log(`✅ Success (${duration}ms)`);
      console.log(`   Risk Score: ${result.riskScore}/100`);
      console.log(`   Cached: ${result.cached ? 'Yes' : 'No'}`);
      
      if (result.factors && result.factors.length > 0) {
        console.log(`   Risk Factors:`);
        result.factors.forEach(factor => {
          console.log(`     - ${factor}`);
        });
      }
      
      // Show which APIs responded
      if (result.details) {
        const apis = Object.keys(result.details);
        console.log(`   APIs Used: ${apis.join(', ')}`);
      }
      
    } catch (error) {
      console.error(`❌ Failed: ${error.message}`);
      if (error.response && error.response.data) {
        console.error(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
  }

  console.log('\n\n📊 Summary:');
  console.log('- If you see "API key not configured" messages, add API keys to .env');
  console.log('- Free API (ip-api.com) should work without configuration');
  console.log('- Check Redis for cached results: redis-cli KEYS "lookup:*"');
}

// Run the tests
runTests().catch(console.error);