const { chromium } = require('playwright');
const path = require('path');

async function comprehensiveVerification() {
  console.log('🔍 Comprehensive Verification of Final SOS Dashboard\n');
  
  const browser = await chromium.launchPersistentContext(
    path.join(__dirname, '.browser-profiles', 'shopify-persistent'),
    {
      headless: false,
      viewport: { width: 1440, height: 900 },
      storageState: path.join(__dirname, '.browser-profiles', 'shopify-state.json')
    }
  );
  
  const page = await browser.newPage();
  
  console.log('📍 Navigating to SOS app...');
  await page.goto('https://admin.shopify.com/store/dev-sandbox-vk/apps/sosv02-development2', {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  
  await page.waitForTimeout(8000);
  
  // Take full screenshot
  const timestamp = Date.now();
  await page.screenshot({ 
    path: `comprehensive-verification-${timestamp}.png`, 
    fullPage: true 
  });
  console.log(`📸 Full screenshot saved: comprehensive-verification-${timestamp}.png\n`);
  
  // Comprehensive checks
  console.log('📋 COMPREHENSIVE VERIFICATION CHECKLIST:\n');
  
  console.log('1️⃣ CORE COMPONENTS:');
  const coreChecks = {
    'Page Title (SOS Dashboard)': await page.locator('h1:has-text("SOS Dashboard")').count() > 0,
    'Subtitle (AI-Powered Store Intelligence)': await page.locator('text=AI-Powered Store Intelligence').count() > 0,
    'View Settings button': await page.locator('button:has-text("View Settings")').count() > 0,
    'Export button': await page.locator('button[aria-label*="Export"]').count() > 0,
    'Notification button': await page.locator('button[aria-label*="Notifications"]').count() > 0,
  };
  
  Object.entries(coreChecks).forEach(([item, found]) => {
    console.log(`   ${found ? '✅' : '❌'} ${item}`);
  });
  
  console.log('\n2️⃣ NEW ENHANCEMENTS:');
  const enhancements = {
    'Onboarding Progress Bar': await page.locator('text=Setup Progress').count() > 0,
    'Progress 75% indicator': await page.locator('text=75% Complete').count() > 0,
    'Welcome Banner': await page.locator('text=Welcome to SOS - Store Operations Shield').count() > 0,
    'Network size in banner': await page.locator('text=Connected to').count() > 0,
  };
  
  Object.entries(enhancements).forEach(([item, found]) => {
    console.log(`   ${found ? '✅' : '❌'} ${item}`);
  });
  
  console.log('\n3️⃣ METRICS CARDS:');
  const metrics = {
    'Sales Card ($12,450)': await page.locator('text=$12,450').count() > 0,
    'Sales trend (+15%)': await page.locator('text=+15% from yesterday').count() > 0,
    'Orders Card (23)': await page.locator('text=23').first().count() > 0,
    'Pending review note': await page.locator('text=3 pending review').count() > 0,
    'Risk Score (Low)': await page.locator('text=Low').count() > 0,
    'Network Size (17,453)': await page.locator('text=17,453').count() > 0,
  };
  
  Object.entries(metrics).forEach(([item, found]) => {
    console.log(`   ${found ? '✅' : '❌'} ${item}`);
  });
  
  console.log('\n4️⃣ SALES CHART:');
  const chartChecks = {
    'Sales Trend heading': await page.locator('text=Sales Trend').count() > 0,
    'Chart SVG element': await page.locator('svg polyline[stroke="#008060"]').count() > 0,
    'Chart points': await page.locator('svg circle[fill="#008060"]').count() > 0,
    '+15% badge': await page.locator('.Polaris-Badge:has-text("+15%")').count() > 0,
    'Last 7 Days label': await page.locator('text=Last 7 Days').count() > 0,
  };
  
  Object.entries(chartChecks).forEach(([item, found]) => {
    console.log(`   ${found ? '✅' : '❌'} ${item}`);
  });
  
  console.log('\n5️⃣ AI ASSISTANT:');
  const aiChecks = {
    'AI Store Assistant heading': await page.locator('text=AI Store Assistant').count() > 0,
    'Beta badge': await page.locator('.Polaris-Badge:has-text("Beta")').count() > 0,
    'Quick questions label': await page.locator('text=Quick questions:').count() > 0,
    'Suggested question chips': await page.locator('.Polaris-Tag').count() > 0,
    'Question chip content': await page.locator('text="What were my sales yesterday?"').count() > 0,
    'Input field': await page.locator('input[placeholder*="What were my sales"]').count() > 0,
    'Voice input button': await page.locator('button[aria-label="Voice input"]').count() > 0,
    'Ask AI button': await page.locator('button:has-text("Ask AI")').count() > 0,
    'Help text': await page.locator('text=Try questions about sales').count() > 0,
  };
  
  Object.entries(aiChecks).forEach(([item, found]) => {
    console.log(`   ${found ? '✅' : '❌'} ${item}`);
  });
  
  console.log('\n6️⃣ FRAUD CHECKS TABLE:');
  const tableChecks = {
    'Recent Fraud Checks heading': await page.locator('text=Recent Fraud Checks').count() > 0,
    'Export button in table': await page.locator('button:has-text("Export")').count() > 0,
    'View all button': await page.locator('button:has-text("View all")').count() > 0,
    'DataTable present': await page.locator('.Polaris-DataTable').count() > 0,
    'Risk score legend': await page.locator('text=Safe (0-30)').count() > 0,
  };
  
  Object.entries(tableChecks).forEach(([item, found]) => {
    console.log(`   ${found ? '✅' : '❌'} ${item}`);
  });
  
  // Count totals
  const allChecks = {...coreChecks, ...enhancements, ...metrics, ...chartChecks, ...aiChecks, ...tableChecks};
  const passed = Object.values(allChecks).filter(v => v).length;
  const total = Object.values(allChecks).length;
  
  console.log(`\n📊 FINAL SCORE: ${passed}/${total} checks passed (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log('🎉 PERFECT! All features verified successfully!');
  } else {
    console.log('⚠️  Some features need attention');
  }
  
  // Test interactivity
  console.log('\n7️⃣ TESTING INTERACTIVITY:');
  
  // Click a suggested question
  const questionChip = page.locator('.Polaris-Tag').first();
  if (await questionChip.isVisible()) {
    await questionChip.click();
    await page.waitForTimeout(2000);
    const inputValue = await page.locator('input[placeholder*="What were my sales"]').inputValue();
    console.log(`   ✅ Clicked question chip - Input filled with: "${inputValue}"`);
  }
  
  // Check notification popover
  const notifButton = page.locator('button[aria-label*="Notifications"]').first();
  if (await notifButton.isVisible()) {
    await notifButton.click();
    await page.waitForTimeout(1000);
    const popoverVisible = await page.locator('.Polaris-Popover').isVisible();
    console.log(`   ${popoverVisible ? '✅' : '❌'} Notification popover opens`);
    if (popoverVisible) {
      await page.click('body'); // Close popover
    }
  }
  
  console.log('\n✅ Comprehensive verification complete!');
  console.log('📁 Check the screenshot for visual confirmation');
  
  await browser.close();
}

comprehensiveVerification().catch(console.error);