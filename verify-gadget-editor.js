const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function verifyGadgetEditor() {
  console.log('🔍 Verifying Gadget Editor\n');
  
  // Use persistent profile
  const profilePath = path.join(__dirname, '.browser-profiles', 'chrome-persistent');
  const statePath = path.join(__dirname, '.browser-profiles', 'state.json');
  
  const browser = await chromium.launchPersistentContext(profilePath, {
    headless: false,
    viewport: { width: 1280, height: 720 },
    storageState: fs.existsSync(statePath) ? statePath : undefined,
  });
  
  const page = await browser.newPage();
  
  console.log('📍 Navigating to Gadget editor...');
  await page.goto('https://sosv02.gadget.app/edit/development', {
    waitUntil: 'networkidle',
    timeout: 60000
  });
  
  // Wait for editor to load
  await page.waitForTimeout(5000);
  
  // Check if we're in the editor
  const url = page.url();
  const title = await page.title();
  
  console.log(`Current URL: ${url}`);
  console.log(`Page title: ${title}`);
  
  // Look for key elements
  const checks = {
    'File explorer': await page.locator('text=/Files|web\\/routes/').count() > 0,
    '_app._index.tsx file': await page.locator('text=_app._index.tsx').count() > 0,
    'Editor pane': await page.locator('text=/export default|function|import/').count() > 0,
    'Development environment': await page.locator('text=development').count() > 0,
  };
  
  console.log('\n📋 Editor checks:');
  Object.entries(checks).forEach(([item, found]) => {
    console.log(`  ${found ? '✅' : '❌'} ${item}`);
  });
  
  // Try to find and click on _app._index.tsx
  try {
    const fileLink = page.locator('text=_app._index.tsx').first();
    if (await fileLink.isVisible()) {
      console.log('\n🎯 Found _app._index.tsx, clicking to open...');
      await fileLink.click();
      await page.waitForTimeout(2000);
      
      // Check for AI Assistant code
      const editorContent = await page.locator('.monaco-editor, .editor, [role="textbox"]').textContent().catch(() => '');
      const hasAICode = editorContent.includes('AI Store Assistant') || 
                       editorContent.includes('handleAskAI') ||
                       editorContent.includes('aiResponse');
      
      console.log(`\n🤖 AI Assistant code present: ${hasAICode ? '✅ YES' : '❌ NO'}`);
    }
  } catch (e) {
    console.log('Could not open file:', e.message);
  }
  
  // Take screenshot
  const screenshotPath = path.join(__dirname, 'gadget-editor-verify.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`\n📸 Screenshot saved: ${screenshotPath}`);
  
  console.log('\nKeeping browser open for inspection...');
  await new Promise(() => {});
}

verifyGadgetEditor().catch(console.error);