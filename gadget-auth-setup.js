const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Gadget-specific browser profile
const GADGET_PROFILE_DIR = path.join(__dirname, '.browser-profiles', 'gadget-persistent');
const GADGET_STATE_FILE = path.join(__dirname, '.browser-profiles', 'gadget-state.json');

// Ensure directory exists
if (!fs.existsSync(GADGET_PROFILE_DIR)) {
  fs.mkdirSync(GADGET_PROFILE_DIR, { recursive: true });
}

async function setupGadgetAuth() {
  console.log('🔐 Gadget Authentication Setup\n');
  console.log('This will set up persistent login for Gadget editor access.\n');
  
  const browser = await chromium.launchPersistentContext(GADGET_PROFILE_DIR, {
    headless: false,
    viewport: { width: 1280, height: 720 },
    storageState: fs.existsSync(GADGET_STATE_FILE) ? GADGET_STATE_FILE : undefined,
    // Important: Accept all permissions for Gadget
    permissions: ['clipboard-read', 'clipboard-write'],
    bypassCSP: true,
    ignoreHTTPSErrors: true,
  });
  
  const page = await browser.newPage();
  
  console.log('📍 Navigating to Gadget editor...');
  await page.goto('https://sosv02.gadget.app/edit/development', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  // Check if we need to login
  const currentUrl = page.url();
  const needsAuth = currentUrl.includes('accounts.google.com') || 
                   currentUrl.includes('login') ||
                   currentUrl.includes('auth');
  
  if (needsAuth) {
    console.log('\n🔑 Please complete the Google login process.');
    console.log('After logging in, the session will be saved for future use.\n');
    
    // Wait for successful login (navigation away from auth pages)
    try {
      await page.waitForFunction(
        () => {
          const url = window.location.href;
          return !url.includes('accounts.google.com') && 
                 !url.includes('login') && 
                 !url.includes('auth') &&
                 url.includes('gadget.app');
        },
        { timeout: 300000 } // 5 minutes to login
      );
      
      console.log('✅ Login successful!');
    } catch (e) {
      console.log('⏱️ Login timeout - please complete login and run again.');
    }
  } else {
    console.log('✅ Already authenticated!');
  }
  
  // Save authentication state
  await browser.storageState({ path: GADGET_STATE_FILE });
  console.log('💾 Authentication saved to gadget-state.json');
  
  // Check if we're in the editor
  const inEditor = await page.locator('text=/Files|Editor|Problems/').count() > 0;
  
  if (inEditor) {
    console.log('\n📂 Successfully accessed Gadget editor!');
    
    // Look for key UI elements
    const elements = {
      'File Explorer': await page.locator('[aria-label*="Files"], text=Files').count() > 0,
      'Problems Pane': await page.locator('text=Problems').count() > 0,
      'Editor Area': await page.locator('.monaco-editor, .editor').count() > 0,
      'Terminal': await page.locator('text=Terminal').count() > 0,
    };
    
    console.log('\n🔍 Editor elements found:');
    Object.entries(elements).forEach(([name, found]) => {
      console.log(`  ${found ? '✅' : '❌'} ${name}`);
    });
  }
  
  console.log('\n✨ Setup complete! Use gadget-access.js to access the editor programmatically.');
  console.log('\n⏸️  Keeping browser open. Press Ctrl+C to close.');
  
  await new Promise(() => {});
}

setupGadgetAuth().catch(console.error);