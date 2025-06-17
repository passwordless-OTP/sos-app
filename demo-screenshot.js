const puppeteer = require('puppeteer');

(async () => {
  console.log('📸 Taking demo screenshot...');
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  // First go to the direct preview URL
  console.log('Loading SOS Dashboard directly...');
  await page.goto('https://sosv02--development.gadget.app', { 
    waitUntil: 'networkidle0',
    timeout: 30000 
  });
  
  await page.waitForTimeout(5000);
  
  // Take screenshot
  const timestamp = Date.now();
  await page.screenshot({ 
    path: `sos-demo-${timestamp}.png`,
    fullPage: true 
  });
  
  console.log(`✅ Screenshot saved: sos-demo-${timestamp}.png`);
  console.log('👀 Keep browser open to access the app');
  
  // Keep browser open for demo
})();