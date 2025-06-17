const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Browser profile configuration
const BROWSER_PROFILES_DIR = path.join(__dirname, '.browser-profiles');
const CHROME_PROFILE = path.join(BROWSER_PROFILES_DIR, 'chrome-profile');
const COOKIES_FILE = path.join(BROWSER_PROFILES_DIR, 'cookies.json');

// Ensure profile directory exists
if (!fs.existsSync(BROWSER_PROFILES_DIR)) {
  fs.mkdirSync(BROWSER_PROFILES_DIR, { recursive: true });
}

/**
 * Launch browser with persistent profile
 * @param {Object} options - Additional browser options
 * @returns {Promise<Object>} Browser instance
 */
async function launchPersistentBrowser(options = {}) {
  console.log('🌐 Launching browser with persistent profile...');
  
  const browser = await chromium.launchPersistentContext(CHROME_PROFILE, {
    headless: false,
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    ...options,
    // Persist cookies, localStorage, and sessions
    acceptDownloads: true,
    bypassCSP: true,
    ignoreHTTPSErrors: true,
  });

  // Load saved cookies if they exist
  if (fs.existsSync(COOKIES_FILE)) {
    try {
      const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf8'));
      await browser.addCookies(cookies);
      console.log('✅ Loaded saved cookies');
    } catch (error) {
      console.log('⚠️ Could not load cookies:', error.message);
    }
  }

  return browser;
}

/**
 * Save browser cookies for next session
 * @param {Object} context - Browser context
 */
async function saveCookies(context) {
  try {
    const cookies = await context.cookies();
    fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2));
    console.log('💾 Saved cookies for next session');
  } catch (error) {
    console.error('❌ Error saving cookies:', error);
  }
}

/**
 * Check dashboard with persistent login
 * @param {string} url - Dashboard URL
 */
async function checkDashboard(url = 'https://sosv02--development.gadget.app') {
  const browser = await launchPersistentBrowser();
  
  try {
    const page = await browser.newPage();
    console.log(`📍 Navigating to: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle' });
    
    // Check if we're already logged in
    const isLoggedIn = await page.evaluate(() => {
      // Check for AI Assistant or other dashboard elements
      return document.body.textContent.includes('AI Store Assistant') ||
             document.body.textContent.includes('SOS Dashboard');
    });
    
    if (isLoggedIn) {
      console.log('✅ Already logged in! Dashboard accessible');
      
      // Take a screenshot for verification
      const screenshotPath = path.join(__dirname, 'dashboard-screenshot.png');
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`📸 Screenshot saved: ${screenshotPath}`);
      
      // Check for AI Assistant
      const hasAIAssistant = await page.evaluate(() => {
        return document.body.textContent.includes('AI Store Assistant');
      });
      
      console.log(`🤖 AI Assistant: ${hasAIAssistant ? 'Found' : 'Not found'}`);
    } else {
      console.log('🔐 Login required - complete login and run again');
      console.log('💡 Tip: Complete login once, and it will persist for future runs');
    }
    
    // Save cookies before closing
    await saveCookies(browser);
    
    // Keep browser open for manual inspection
    console.log('\n⏸️  Browser will stay open. Press Ctrl+C to close.');
    await new Promise(() => {}); // Keep running
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await browser.close();
  }
}

// Export functions for reuse
module.exports = {
  launchPersistentBrowser,
  saveCookies,
  checkDashboard,
  BROWSER_PROFILES_DIR,
  CHROME_PROFILE,
  COOKIES_FILE
};

// Run if called directly
if (require.main === module) {
  checkDashboard().catch(console.error);
}