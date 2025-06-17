const TestUtils = require('./utils');
const config = require('./config');

class FunctionalTests {
  constructor() {
    this.utils = new TestUtils();
    this.results = [];
  }
  
  async runAll() {
    console.log('🧪 SOS App Functional Test Suite\n');
    
    try {
      await this.utils.setup();
      
      // Run test categories
      await this.testDashboardLoading();
      await this.testAIAssistant();
      await this.testFraudDetection();
      await this.testMetricsDisplay();
      
      // Summary
      this.printSummary();
      
    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      await this.utils.cleanup();
    }
  }
  
  async testDashboardLoading() {
    console.log('\n📊 Testing Dashboard Loading...');
    
    const result = await this.utils.navigateToApp();
    this.results.push(
      this.utils.logResult('Dashboard loads', result)
    );
    
    if (result) {
      await this.utils.screenshot('dashboard-loaded');
    }
  }
  
  async testAIAssistant() {
    console.log('\n🤖 Testing AI Assistant...');
    
    // Check if AI section exists
    const hasAISection = await this.utils.checkElementExists(config.selectors.aiInput);
    this.results.push(
      this.utils.logResult('AI input field exists', hasAISection)
    );
    
    const hasAIButton = await this.utils.checkElementExists(config.selectors.aiButton);
    this.results.push(
      this.utils.logResult('AI button exists', hasAIButton)
    );
    
    if (hasAISection && hasAIButton) {
      // Test interaction
      try {
        const input = this.utils.page.locator(config.selectors.aiInput).first();
        await input.fill(config.testData.validQuestions[0]);
        
        const button = this.utils.page.locator(config.selectors.aiButton).first();
        await button.click();
        
        // Wait for response
        const hasResponse = await this.utils.waitForElement(
          config.selectors.aiResponse,
          { timeout: config.timeouts.aiResponse }
        );
        
        this.results.push(
          this.utils.logResult('AI responds to query', hasResponse)
        );
        
        if (hasResponse) {
          await this.utils.screenshot('ai-response');
        }
      } catch (e) {
        this.results.push(
          this.utils.logResult('AI interaction', false, e.message)
        );
      }
    }
  }
  
  async testFraudDetection() {
    console.log('\n🔍 Testing Fraud Detection...');
    
    const hasFraudSection = await this.utils.page.locator('text=/fraud|Fraud Check/i').count() > 0;
    this.results.push(
      this.utils.logResult('Fraud section exists', hasFraudSection)
    );
    
    if (hasFraudSection) {
      // Test fraud check form
      const hasEmailInput = await this.utils.checkElementExists(config.selectors.emailInput);
      const hasCheckButton = await this.utils.checkElementExists(config.selectors.fraudCheckButton);
      
      this.results.push(
        this.utils.logResult('Fraud check form', hasEmailInput && hasCheckButton)
      );
      
      if (hasEmailInput && hasCheckButton) {
        try {
          // Test with suspicious email
          const emailInput = this.utils.page.locator(config.selectors.emailInput).first();
          await emailInput.fill(config.testData.fraudTestCases[1].email);
          
          const checkButton = this.utils.page.locator(config.selectors.fraudCheckButton).first();
          await checkButton.click();
          
          // Wait for result
          await this.utils.page.waitForTimeout(2000);
          const hasRiskIndicator = await this.utils.page.locator('text=/High Risk|Risk|Score/').count() > 0;
          
          this.results.push(
            this.utils.logResult('Fraud check shows results', hasRiskIndicator)
          );
          
        } catch (e) {
          this.results.push(
            this.utils.logResult('Fraud check interaction', false, e.message)
          );
        }
      }
    }
  }
  
  async testMetricsDisplay() {
    console.log('\n📈 Testing Metrics Display...');
    
    const metrics = [
      { name: 'Sales metric', selector: config.selectors.salesMetric },
      { name: 'Orders metric', selector: config.selectors.ordersMetric },
      { name: 'Fraud/Risk metric', selector: config.selectors.fraudMetric }
    ];
    
    for (const metric of metrics) {
      const exists = await this.utils.page.locator(metric.selector).count() > 0;
      this.results.push(
        this.utils.logResult(metric.name, exists)
      );
    }
    
    await this.utils.screenshot('metrics-display');
  }
  
  printSummary() {
    console.log('\n📋 Test Summary');
    console.log('================');
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    
    console.log(`Total: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${Math.round((passed/total) * 100)}%`);
    
    if (failed > 0) {
      console.log('\nFailed Tests:');
      this.results.filter(r => !r.passed).forEach(r => {
        console.log(`  - ${r.testName}: ${r.details}`);
      });
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tests = new FunctionalTests();
  tests.runAll();
}

module.exports = FunctionalTests;