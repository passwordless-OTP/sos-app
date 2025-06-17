const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const GADGET_PROFILE_DIR = path.join(__dirname, '.browser-profiles', 'gadget-persistent');
const GADGET_STATE_FILE = path.join(__dirname, '.browser-profiles', 'gadget-state.json');

class GadgetAccess {
  constructor() {
    this.browser = null;
    this.page = null;
  }
  
  async init() {
    console.log('🚀 Initializing Gadget Access...\n');
    
    this.browser = await chromium.launchPersistentContext(GADGET_PROFILE_DIR, {
      headless: process.env.HEADLESS === 'true',
      viewport: { width: 1280, height: 720 },
      storageState: fs.existsSync(GADGET_STATE_FILE) ? GADGET_STATE_FILE : undefined,
    });
    
    this.page = await this.browser.newPage();
    
    await this.page.goto('https://sosv02.gadget.app/edit/development', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    // Wait for editor to load
    await this.page.waitForSelector('text=/Files|Editor/', { timeout: 30000 });
    console.log('✅ Connected to Gadget editor\n');
  }
  
  async checkProblems() {
    console.log('🔍 Checking Problems pane...\n');
    
    try {
      // Click on Problems tab if not visible
      const problemsTab = this.page.locator('text=Problems').first();
      if (await problemsTab.isVisible()) {
        await problemsTab.click();
        await this.page.waitForTimeout(1000);
      }
      
      // Look for error/warning indicators
      const problemIndicators = await this.page.locator('.problems-stat, .problem-count, .error-count, .warning-count').allTextContents();
      
      if (problemIndicators.length > 0) {
        console.log('📊 Problem indicators:', problemIndicators.join(', '));
      }
      
      // Get actual problem messages
      const problems = await this.page.locator('.problem-item, .monaco-list-row, .problem-message').allTextContents();
      
      if (problems.length > 0) {
        console.log('\n❌ Problems found:');
        problems.forEach((problem, i) => {
          if (problem.trim()) {
            console.log(`  ${i + 1}. ${problem.trim()}`);
          }
        });
      } else {
        console.log('✅ No problems found in Problems pane');
      }
      
      // Take screenshot of problems area
      await this.screenshot('problems-pane');
      
    } catch (e) {
      console.log('⚠️ Could not access Problems pane:', e.message);
    }
  }
  
  async checkFile(filePath) {
    console.log(`\n📄 Checking file: ${filePath}\n`);
    
    try {
      // Search for file in explorer
      const searchBox = this.page.locator('input[placeholder*="Search"], input[aria-label*="Search"]').first();
      if (await searchBox.isVisible()) {
        await searchBox.fill(filePath);
        await this.page.waitForTimeout(1000);
      }
      
      // Click on the file
      const fileItem = this.page.locator(`text="${path.basename(filePath)}"`).first();
      if (await fileItem.isVisible()) {
        await fileItem.click();
        await this.page.waitForTimeout(2000);
        
        // Check if file opened
        const editorVisible = await this.page.locator('.monaco-editor').isVisible();
        console.log(`Editor opened: ${editorVisible ? '✅' : '❌'}`);
        
        // Look for AI Assistant code
        const editorContent = await this.page.locator('.view-lines').textContent().catch(() => '');
        const checks = {
          'AI Store Assistant text': editorContent.includes('AI Store Assistant'),
          'handleAskAI function': editorContent.includes('handleAskAI'),
          'useState hooks': editorContent.includes('useState'),
          'Polaris imports': editorContent.includes('@shopify/polaris'),
        };
        
        console.log('\n📋 Code checks:');
        Object.entries(checks).forEach(([check, found]) => {
          console.log(`  ${found ? '✅' : '❌'} ${check}`);
        });
        
        // Check for inline errors
        const inlineErrors = await this.page.locator('.squiggly-error, .monaco-editor-error').count();
        if (inlineErrors > 0) {
          console.log(`\n⚠️ Found ${inlineErrors} inline errors in editor`);
        }
        
      } else {
        console.log('❌ File not found in explorer');
      }
      
    } catch (e) {
      console.log('Error checking file:', e.message);
    }
  }
  
  async checkBuildStatus() {
    console.log('\n🔨 Checking build status...\n');
    
    // Look for build status indicators
    const statusBar = await this.page.locator('.status-bar, .gadget-status, text=/Building|Build/').textContent().catch(() => '');
    if (statusBar) {
      console.log('Status:', statusBar);
    }
    
    // Check for deployment status
    const deploymentStatus = await this.page.locator('text=/Deployed|Deploying|Failed/').first().textContent().catch(() => '');
    if (deploymentStatus) {
      console.log('Deployment:', deploymentStatus);
    }
  }
  
  async screenshot(name) {
    const screenshotPath = path.join(__dirname, `gadget-${name}-${Date.now()}.png`);
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot: ${screenshotPath}`);
  }
  
  async navigateToFile(filePath) {
    // Use keyboard shortcut to open file
    await this.page.keyboard.press('Meta+P'); // Cmd+P on Mac
    await this.page.waitForTimeout(500);
    await this.page.keyboard.type(filePath);
    await this.page.waitForTimeout(500);
    await this.page.keyboard.press('Enter');
    await this.page.waitForTimeout(2000);
  }
  
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run comprehensive check if called directly
async function runFullCheck() {
  const gadget = new GadgetAccess();
  
  try {
    await gadget.init();
    
    // Check problems
    await gadget.checkProblems();
    
    // Check the AI Assistant file
    await gadget.checkFile('web/routes/_app._index.tsx');
    
    // Check build status
    await gadget.checkBuildStatus();
    
    // Final screenshot
    await gadget.screenshot('full-editor');
    
    console.log('\n✅ Gadget check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  // Keep open for manual inspection if not headless
  if (process.env.HEADLESS !== 'true') {
    console.log('\n⏸️  Browser open for inspection. Press Ctrl+C to close.');
    await new Promise(() => {});
  } else {
    await gadget.close();
  }
}

// Export for reuse
module.exports = GadgetAccess;

// Run if called directly
if (require.main === module) {
  runFullCheck();
}