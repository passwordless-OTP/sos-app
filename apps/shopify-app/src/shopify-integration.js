const { Shopify } = require('@shopify/shopify-api');

// This will integrate with your lookup service
async function checkOrder(order) {
  const checks = [];
  
  // Check customer email
  if (order.email) {
    checks.push(fetch('http://localhost:3001/api/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: order.email })
    }));
  }
  
  // Check customer IP
  if (order.customer_ip) {
    checks.push(fetch('http://localhost:3001/api/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: order.customer_ip })
    }));
  }
  
  // Check phone
  if (order.phone) {
    checks.push(fetch('http://localhost:3001/api/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: order.phone })
    }));
  }
  
  const results = await Promise.all(checks);
  return results.map(r => r.json());
}

module.exports = { checkOrder };
