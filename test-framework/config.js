// Centralized test configuration
module.exports = {
  urls: {
    shopifyAdmin: 'https://admin.shopify.com/store/dev-sandbox-vk',
    sosApp: 'https://admin.shopify.com/store/dev-sandbox-vk/apps/sosv02-development2',
    gadgetEditor: 'https://sosv02.gadget.app/edit/development',
  },
  
  selectors: {
    // AI Assistant
    aiInput: 'input[placeholder*="sales"], textarea[placeholder*="ask"], input[placeholder*="question"]',
    aiButton: 'button:has-text("Ask AI"), button:has-text("Submit"), button:has-text("Ask")',
    aiResponse: '[data-testid="ai-response"], .ai-response, div:has-text("Your sales")',
    
    // Dashboard metrics
    salesMetric: 'text=/Sales|Revenue|\\$[0-9]+/',
    ordersMetric: 'text=/Orders|order|[0-9]+ orders/',
    fraudMetric: 'text=/Fraud|Risk|Safe|High Risk/',
    
    // Fraud check
    fraudCheckButton: 'button:has-text("Check"), button:has-text("Run Fraud Check")',
    emailInput: 'input[type="email"], input[placeholder*="email"]',
    orderInput: 'input[placeholder*="order"], input[placeholder*="Order ID"]',
  },
  
  testData: {
    validQuestions: [
      'What were my sales yesterday?',
      'Show me top selling products',
      'How many orders today?',
      'Check for fraud alerts'
    ],
    
    fraudTestCases: [
      { email: 'good@gmail.com', expectedRisk: 'Low' },
      { email: 'suspicious@temp-mail.com', expectedRisk: 'High' },
      { email: 'test@protonmail.com', expectedRisk: 'Medium' }
    ]
  },
  
  timeouts: {
    navigation: 30000,
    aiResponse: 10000,
    element: 5000
  }
};