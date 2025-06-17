const { chromium } = require('playwright');
const path = require('path');

async function quickCheck() {
  const browser = await chromium.launchPersistentContext(
    path.join(__dirname, '.browser-profiles', 'shopify-persistent'),
    {
      headless: false,
      viewport: { width: 1440, height: 900 },
      storageState: path.join(__dirname, '.browser-profiles', 'shopify-state.json')
    }
  );
  
  const page = await browser.newPage();
  
  console.log('Navigating to SOS app...');
  await page.goto('https://admin.shopify.com/store/dev-sandbox-vk/apps/sosv02-development2', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  
  await page.waitForTimeout(10000);
  
  // Check for errors
  const hasError = await page.locator('text=error').count() > 0;
  console.log('Has error text:', hasError);
  
  // Take screenshot
  await page.screenshot({ path: 'current-state.png', fullPage: true });
  console.log('Screenshot saved: current-state.png');
  
  // Try to get any visible text
  const visibleText = await page.locator('body').innerText().catch(() => 'Could not get text');
  console.log('\nVisible text preview:', visibleText.substring(0, 500));
  
  await browser.close();
}

quickCheck().catch(console.error);