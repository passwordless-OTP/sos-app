const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const config = require('./config');

class TestUtils {
  constructor() {
    this.browser = null;
    this.page = null;
    this.context = null;
  }
  
  async setup() {
    // Use Shopify-specific persistent profile
    const profilePath = path.join(__dirname, '..', '.browser-profiles', 'shopify-persistent');
    const statePath = path.join(__dirname, '..', '.browser-profiles', 'shopify-state.json');
    
    this.context = await chromium.launchPersistentContext(profilePath, {
      headless: process.env.HEADLESS === 'true',
      viewport: { width: 1280, height: 720 },
      storageState: fs.existsSync(statePath) ? statePath : undefined,
      video: process.env.RECORD ? 'on' : 'off',
      screenshot: 'only-on-failure'
    });
    
    this.page = await this.context.newPage();
    return this.page;
  }
  
  async navigateToApp() {
    await this.page.goto(config.urls.sosApp, { 
      waitUntil: 'networkidle',
      timeout: config.timeouts.navigation 
    });
    
    // Wait for app to load
    await this.page.waitForTimeout(2000);
    
    // Check if we're in the app
    const url = this.page.url();
    const inApp = url.includes('apps/sosv02');
    
    if (!inApp) {
      throw new Error('Failed to navigate to SOS app');
    }
    
    return true;
  }
  
  async waitForElement(selector, options = {}) {
    const timeout = options.timeout || config.timeouts.element;
    try {
      await this.page.waitForSelector(selector, { timeout, ...options });
      return true;
    } catch (e) {
      console.log(`Element not found: ${selector}`);
      return false;
    }
  }
  
  async screenshot(name) {
    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    const filename = `${name}-${new Date().toISOString().slice(0,10)}.png`;
    await this.page.screenshot({ 
      path: path.join(screenshotDir, filename),
      fullPage: true 
    });
    console.log(`📸 Screenshot saved: ${filename}`);
  }
  
  async checkElementExists(selector) {
    return (await this.page.locator(selector).count()) > 0;
  }
  
  async cleanup() {
    if (this.context) {
      await this.context.close();
    }
  }
  
  // Test result formatter
  logResult(testName, passed, details = '') {
    const icon = passed ? '✅' : '❌';
    const status = passed ? 'PASSED' : 'FAILED';
    console.log(`${icon} ${testName}: ${status} ${details}`);
    return { testName, passed, details };
  }
}

module.exports = TestUtils;