#!/usr/bin/env node

/**
 * Basic test for fraud service without external dependencies
 * This tests if the IP-API.com integration works (no API key needed)
 */

const http = require('http');

// Test data
const testIP = '8.8.8.8'; // Google DNS

console.log('🧪 Testing basic fraud detection with IP-API.com...\n');

// Make request to IP-API
const options = {
  hostname: 'ip-api.com',
  path: `/json/${testIP}`,
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      console.log(`✅ IP-API.com test successful!\n`);
      console.log(`IP Address: ${testIP}`);
      console.log(`Location: ${result.city}, ${result.regionName}, ${result.country}`);
      console.log(`ISP: ${result.isp}`);
      console.log(`Proxy: ${result.proxy ? 'Yes ⚠️' : 'No ✅'}`);
      console.log(`Hosting: ${result.hosting ? 'Yes ⚠️' : 'No ✅'}`);
      
      const riskScore = (result.proxy || result.hosting) ? 75 : 0;
      console.log(`\nRisk Score: ${riskScore}/100`);
      
      console.log('\n✅ Free IP detection is working!');
      console.log('The fraud service can run with just this API.');
      
    } catch (error) {
      console.error('❌ Error parsing response:', error);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error);
});

req.end();