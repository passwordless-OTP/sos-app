const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function quickGadgetCheck() {
  console.log('🔍 Quick Gadget Check\n');
  
  const GADGET_PROFILE_DIR = path.join(__dirname, '.browser-profiles', 'gadget-persistent');
  const GADGET_STATE_FILE = path.join(__dirname, '.browser-profiles', 'gadget-state.json');
  
  const browser = await chromium.launchPersistentContext(GADGET_PROFILE_DIR, {
    headless: false,
    viewport: { width: 1280, height: 720 },
    storageState: GADGET_STATE_FILE,
  });
  
  const page = await browser.newPage();
  
  console.log('Navigating to Gadget...');
  await page.goto('https://sosv02.gadget.app/edit/development', {
    waitUntil: 'domcontentloaded'
  });
  
  // Quick wait
  await page.waitForTimeout(8000);
  
  // Take screenshot
  const screenshotPath = path.join(__dirname, `gadget-editor-${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`📸 Screenshot: ${screenshotPath}`);
  
  // Quick checks
  const hasEditor = await page.locator('.monaco-editor, text=Files').count() > 0;
  const hasProblems = await page.locator('text=Problems').count() > 0;
  
  console.log(`\nEditor loaded: ${hasEditor ? '✅' : '❌'}`);
  console.log(`Problems pane available: ${hasProblems ? '✅' : '❌'}`);
  
  console.log('\nKeeping browser open...');
  await new Promise(() => {});
}

quickGadgetCheck();