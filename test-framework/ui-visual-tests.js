const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

class UIVisualTests {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baselineDir = path.join(__dirname, 'visual-baselines');
    this.resultsDir = path.join(__dirname, 'visual-results');
    
    // Create directories if they don't exist
    [this.baselineDir, this.resultsDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }
  
  async setup() {
    const profilePath = path.join(__dirname, '..', '.browser-profiles', 'shopify-persistent');
    const statePath = path.join(__dirname, '..', '.browser-profiles', 'shopify-state.json');
    
    this.browser = await chromium.launchPersistentContext(profilePath, {
      headless: process.env.HEADLESS === 'true',
      viewport: { width: 1280, height: 720 },
      storageState: fs.existsSync(statePath) ? statePath : undefined,
      // Consistent rendering
      deviceScaleFactor: 1,
      hasTouch: false,
      locale: 'en-US',
      timezoneId: 'America/New_York',
    });
    
    this.page = await this.browser.newPage();
    
    // Set consistent animations
    await this.page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
  }
  
  async runAll() {
    console.log('🎨 UI Visual Testing Suite\n');
    
    try {
      await this.setup();
      
      // Navigate to app
      await this.page.goto('https://admin.shopify.com/store/dev-sandbox-vk/apps/sosv02-development2', {
        waitUntil: 'networkidle',
        timeout: 60000
      });
      
      // Wait for app to fully load
      await this.page.waitForTimeout(5000);
      
      // Run visual tests
      await this.testPolarisCompliance();
      await this.testResponsiveDesign();
      await this.testComponentStates();
      await this.testAccessibility();
      await this.testColorContrast();
      
      console.log('\n✅ UI Visual Tests Complete');
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      await this.cleanup();
    }
  }
  
  async testPolarisCompliance() {
    console.log('\n📐 Testing Polaris Compliance...');
    
    const checks = {
      'Primary button color': await this.checkButtonColor('primary', '#008060'),
      'Card shadows': await this.checkCardShadows(),
      'Font family': await this.checkFontFamily('Inter, -apple-system'),
      'Spacing units': await this.checkSpacingUnits(),
    };
    
    Object.entries(checks).forEach(([test, passed]) => {
      console.log(`  ${passed ? '✅' : '❌'} ${test}`);
    });
  }
  
  async testResponsiveDesign() {
    console.log('\n📱 Testing Responsive Design...');
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1440, height: 900 },
    ];
    
    for (const viewport of viewports) {
      await this.page.setViewportSize(viewport);
      await this.page.waitForTimeout(1000);
      
      const screenshotPath = path.join(this.resultsDir, `responsive-${viewport.name.toLowerCase()}.png`);
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      
      console.log(`  ✅ ${viewport.name} (${viewport.width}x${viewport.height})`);
    }
  }
  
  async testComponentStates() {
    console.log('\n🔄 Testing Component States...');
    
    // Test button hover state
    const button = this.page.locator('button:has-text("Ask AI")').first();
    if (await button.isVisible()) {
      // Normal state
      await this.captureElement(button, 'button-normal');
      
      // Hover state
      await button.hover();
      await this.captureElement(button, 'button-hover');
      
      // Focused state
      await button.focus();
      await this.captureElement(button, 'button-focus');
      
      console.log('  ✅ Button states captured');
    }
    
    // Test input field states
    const input = this.page.locator('input[placeholder*="sales"]').first();
    if (await input.isVisible()) {
      // Empty state
      await this.captureElement(input, 'input-empty');
      
      // Filled state
      await input.fill('Test query');
      await this.captureElement(input, 'input-filled');
      
      // Focused state
      await input.focus();
      await this.captureElement(input, 'input-focused');
      
      console.log('  ✅ Input states captured');
    }
  }
  
  async testAccessibility() {
    console.log('\n♿ Testing Accessibility...');
    
    // Check for ARIA labels
    const ariaChecks = {
      'Main navigation': await this.page.locator('[role="navigation"]').count() > 0,
      'Button labels': await this.page.locator('button[aria-label]').count() > 0,
      'Form labels': await this.page.locator('label[for]').count() > 0,
      'Heading hierarchy': await this.checkHeadingHierarchy(),
    };
    
    Object.entries(ariaChecks).forEach(([test, passed]) => {
      console.log(`  ${passed ? '✅' : '❌'} ${test}`);
    });
    
    // Tab navigation test
    console.log('  🔄 Testing keyboard navigation...');
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    
    const focusedElement = await this.page.evaluate(() => {
      return document.activeElement?.tagName;
    });
    
    console.log(`  ✅ Tab navigation (focused: ${focusedElement})`);
  }
  
  async testColorContrast() {
    console.log('\n🎨 Testing Color Contrast...');
    
    // Check text contrast ratios
    const contrastChecks = await this.page.evaluate(() => {
      const getContrast = (rgb1, rgb2) => {
        // Simplified contrast calculation
        const getLuminance = (r, g, b) => {
          const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        };
        
        const l1 = getLuminance(...rgb1);
        const l2 = getLuminance(...rgb2);
        return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
      };
      
      // Check various text elements
      const results = {};
      const texts = document.querySelectorAll('p, span, h1, h2, h3');
      
      texts.forEach((el, i) => {
        if (i < 5) { // Check first 5 elements
          const style = window.getComputedStyle(el);
          const color = style.color;
          const bgColor = style.backgroundColor;
          
          // Parse colors (simplified)
          const parseColor = (color) => {
            const match = color.match(/\d+/g);
            return match ? match.map(Number) : [0, 0, 0];
          };
          
          const fg = parseColor(color);
          const bg = parseColor(bgColor);
          const ratio = getContrast(fg, bg);
          
          results[el.tagName] = ratio >= 4.5 ? 'Pass' : 'Fail';
        }
      });
      
      return results;
    });
    
    Object.entries(contrastChecks).forEach(([element, result]) => {
      console.log(`  ${result === 'Pass' ? '✅' : '❌'} ${element} contrast`);
    });
  }
  
  // Helper methods
  async checkButtonColor(type, expectedColor) {
    const button = await this.page.locator(`button.Polaris-Button--${type}`).first();
    if (await button.count() === 0) return false;
    
    const color = await button.evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    
    return color.includes(expectedColor);
  }
  
  async checkCardShadows() {
    const card = await this.page.locator('.Polaris-Card, [class*="Card"]').first();
    if (await card.count() === 0) return false;
    
    const shadow = await card.evaluate(el => 
      window.getComputedStyle(el).boxShadow
    );
    
    return shadow && shadow !== 'none';
  }
  
  async checkFontFamily(expectedFont) {
    const body = await this.page.locator('body').first();
    const fontFamily = await body.evaluate(el => 
      window.getComputedStyle(el).fontFamily
    );
    
    return fontFamily.includes(expectedFont);
  }
  
  async checkSpacingUnits() {
    // Polaris uses 4px base unit
    const element = await this.page.locator('.Polaris-Card, [class*="Card"]').first();
    if (await element.count() === 0) return false;
    
    const padding = await element.evaluate(el => 
      window.getComputedStyle(el).padding
    );
    
    // Check if padding is multiple of 4
    const match = padding.match(/\d+/);
    if (match) {
      const value = parseInt(match[0]);
      return value % 4 === 0;
    }
    
    return false;
  }
  
  async checkHeadingHierarchy() {
    const headings = await this.page.evaluate(() => {
      const h1 = document.querySelectorAll('h1').length;
      const h2 = document.querySelectorAll('h2').length;
      const h3 = document.querySelectorAll('h3').length;
      
      // Should have one h1, and h2s should exist if h3s exist
      return h1 === 1 && (h3 === 0 || h2 > 0);
    });
    
    return headings;
  }
  
  async captureElement(element, name) {
    const screenshotPath = path.join(this.resultsDir, `${name}.png`);
    await element.screenshot({ path: screenshotPath });
  }
  
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tests = new UIVisualTests();
  tests.runAll();
}

module.exports = UIVisualTests;