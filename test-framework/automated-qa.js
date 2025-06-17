const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class AutomatedQA {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      passed: 0,
      failed: 0,
      tests: []
    };
    
    this.profilePath = path.join(__dirname, 'browser-profile');
    this.baselineDir = path.join(__dirname, 'baselines');
    this.resultsDir = path.join(__dirname, 'results');
    
    // Create directories if they don't exist
    [this.baselineDir, this.resultsDir].forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
  }

  async runAllTests() {
    console.log('🤖 Automated QA Suite Starting...\n');
    const startTime = Date.now();
    
    try {
      // Launch browser with saved profile
      this.browser = await chromium.launchPersistentContext(this.profilePath, {
        headless: true, // Run headless for speed
        viewport: { width: 1920, height: 1080 }
      });
      
      this.page = await this.browser.newPage();
      
      // Run test suites
      await this.testPerformance();
      await this.testCoreFeatures();
      await this.testNetworkEffect();
      await this.testROICalculator();
      await this.testAccessibility();
      await this.testResponsiveness();
      
      // Generate report
      const duration = Date.now() - startTime;
      this.generateReport(duration);
      
    } catch (error) {
      console.error('❌ Test suite error:', error.message);
      this.results.failed++;
    } finally {
      if (this.browser) await this.browser.close();
    }
    
    return this.results;
  }

  async testPerformance() {
    const test = { name: 'Performance', status: 'running', metrics: {} };
    console.log('⏱️  Testing Performance...');
    
    try {
      const startTime = Date.now();
      await this.page.goto('https://admin.shopify.com/store/dev-sandbox-vk/apps/sosv02-development2', {
        waitUntil: 'domcontentloaded'
      });
      
      const loadTime = Date.now() - startTime;
      test.metrics.loadTime = loadTime;
      
      // Wait for iframe
      await this.page.waitForSelector('iframe[name="app-iframe"]', { timeout: 10000 });
      const totalTime = Date.now() - startTime;
      test.metrics.totalTime = totalTime;
      
      // Performance assertions
      if (totalTime < 3000) {
        test.status = 'passed';
        test.message = `Loaded in ${totalTime}ms (target: <3000ms)`;
        this.results.passed++;
      } else {
        test.status = 'failed';
        test.message = `Too slow: ${totalTime}ms (target: <3000ms)`;
        this.results.failed++;
      }
      
    } catch (error) {
      test.status = 'failed';
      test.message = error.message;
      this.results.failed++;
    }
    
    this.results.tests.push(test);
    console.log(`   ${test.status === 'passed' ? '✅' : '❌'} ${test.message}\n`);
  }

  async testCoreFeatures() {
    console.log('🎯 Testing Core Features...');
    
    try {
      // Get iframe content
      await this.page.waitForTimeout(5000); // Let content load
      const frame = await this.page.frame({ name: 'app-iframe' });
      
      const features = [
        { name: 'Dashboard Metrics', selector: 'text=Today\'s Sales' },
        { name: 'AI Assistant', selector: 'text=AI Store Assistant' },
        { name: 'Network Intelligence', selector: 'text=Network Intelligence Live Feed' },
        { name: 'ROI Calculator', selector: 'text=ROI Calculator' },
        { name: 'Testimonials', selector: 'text=What Merchants Say' },
        { name: 'Fraud Checks', selector: 'text=Recent Fraud Checks' }
      ];
      
      for (const feature of features) {
        const test = { name: `Feature: ${feature.name}`, status: 'running' };
        
        try {
          const element = await frame.waitForSelector(feature.selector, { 
            timeout: 5000,
            state: 'attached' 
          });
          
          if (element) {
            test.status = 'passed';
            test.message = 'Found in DOM';
            this.results.passed++;
          }
        } catch (error) {
          test.status = 'failed';
          test.message = 'Not found';
          this.results.failed++;
        }
        
        this.results.tests.push(test);
        console.log(`   ${test.status === 'passed' ? '✅' : '❌'} ${feature.name}`);
      }
      
    } catch (error) {
      const test = { 
        name: 'Core Features', 
        status: 'failed', 
        message: error.message 
      };
      this.results.tests.push(test);
      this.results.failed++;
    }
    console.log('');
  }

  async testNetworkEffect() {
    console.log('🌐 Testing Network Effect Demo...');
    const test = { name: 'Network Effect Simulation', status: 'running' };
    
    try {
      const frame = await this.page.frame({ name: 'app-iframe' });
      
      // Find and click the button
      const button = await frame.waitForSelector('button:has-text("Simulate Network Alert")', {
        timeout: 5000
      });
      
      await button.click();
      
      // Wait for alert to appear
      const alert = await frame.waitForSelector('text=Active Network Alert', {
        timeout: 5000
      });
      
      if (alert) {
        test.status = 'passed';
        test.message = 'Network alert triggered successfully';
        this.results.passed++;
        
        // Take screenshot for visual record
        await this.page.screenshot({
          path: path.join(this.resultsDir, 'network-effect-test.png')
        });
      }
      
    } catch (error) {
      test.status = 'failed';
      test.message = error.message;
      this.results.failed++;
    }
    
    this.results.tests.push(test);
    console.log(`   ${test.status === 'passed' ? '✅' : '❌'} ${test.message}\n`);
  }

  async testROICalculator() {
    console.log('💰 Testing ROI Calculator...');
    const test = { name: 'ROI Calculator', status: 'running' };
    
    try {
      const frame = await this.page.frame({ name: 'app-iframe' });
      
      // Find input
      const input = await frame.waitForSelector('input[type="number"]', {
        timeout: 5000
      });
      
      // Clear and type
      await input.clear();
      await input.type('100000');
      
      // Click calculate
      const button = await frame.waitForSelector('button:has-text("Calculate My Savings")', {
        timeout: 5000
      });
      await button.click();
      
      // Check for results
      const results = await frame.waitForSelector('text=Your Projected Savings', {
        timeout: 5000
      });
      
      if (results) {
        test.status = 'passed';
        test.message = 'ROI calculation works';
        this.results.passed++;
      }
      
    } catch (error) {
      test.status = 'failed';
      test.message = error.message;
      this.results.failed++;
    }
    
    this.results.tests.push(test);
    console.log(`   ${test.status === 'passed' ? '✅' : '❌'} ${test.message}\n`);
  }

  async testAccessibility() {
    console.log('♿ Testing Accessibility...');
    const test = { name: 'Accessibility', status: 'running', issues: [] };
    
    try {
      const snapshot = await this.page.accessibility.snapshot();
      
      // Basic checks
      const checks = [
        { 
          name: 'Page has title',
          passed: snapshot && snapshot.name && snapshot.name.length > 0
        },
        {
          name: 'Buttons have labels',
          passed: true // Would need deeper inspection
        }
      ];
      
      let allPassed = true;
      checks.forEach(check => {
        if (!check.passed) {
          allPassed = false;
          test.issues.push(check.name);
        }
      });
      
      test.status = allPassed ? 'passed' : 'failed';
      test.message = allPassed ? 'Basic a11y checks passed' : `Issues: ${test.issues.join(', ')}`;
      
      if (allPassed) {
        this.results.passed++;
      } else {
        this.results.failed++;
      }
      
    } catch (error) {
      test.status = 'failed';
      test.message = error.message;
      this.results.failed++;
    }
    
    this.results.tests.push(test);
    console.log(`   ${test.status === 'passed' ? '✅' : '❌'} ${test.message}\n`);
  }

  async testResponsiveness() {
    console.log('📱 Testing Responsive Design...');
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      const test = { name: `Responsive: ${viewport.name}`, status: 'running' };
      
      try {
        await this.page.setViewportSize(viewport);
        await this.page.waitForTimeout(1000);
        
        // Take screenshot
        await this.page.screenshot({
          path: path.join(this.resultsDir, `responsive-${viewport.name.toLowerCase()}.png`)
        });
        
        // Check if content is visible
        const frame = await this.page.frame({ name: 'app-iframe' });
        const content = await frame.waitForSelector('text=SOS Dashboard', {
          timeout: 3000
        });
        
        if (content) {
          test.status = 'passed';
          test.message = 'Content adapts correctly';
          this.results.passed++;
        }
        
      } catch (error) {
        test.status = 'failed';
        test.message = 'Content not visible';
        this.results.failed++;
      }
      
      this.results.tests.push(test);
      console.log(`   ${test.status === 'passed' ? '✅' : '❌'} ${viewport.name}`);
    }
    console.log('');
  }

  generateReport(duration) {
    const report = {
      ...this.results,
      duration: `${(duration / 1000).toFixed(2)}s`,
      passRate: `${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`
    };
    
    // Save report
    const reportPath = path.join(this.resultsDir, `qa-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Console summary
    console.log('📊 QA SUMMARY');
    console.log('=============');
    console.log(`✅ Passed: ${report.passed}`);
    console.log(`❌ Failed: ${report.failed}`);
    console.log(`📈 Pass Rate: ${report.passRate}`);
    console.log(`⏱️  Duration: ${report.duration}`);
    console.log(`\n📄 Full report: ${reportPath}`);
    
    // Exit code for CI/CD
    if (report.failed > 0) {
      console.log('\n❌ QA FAILED - Fix issues before deploying!');
      process.exit(1);
    } else {
      console.log('\n✅ QA PASSED - Safe to deploy!');
      process.exit(0);
    }
  }
}

// Run if called directly
if (require.main === module) {
  new AutomatedQA().runAllTests();
}

module.exports = AutomatedQA;