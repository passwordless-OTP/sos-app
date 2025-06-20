#!/usr/bin/env node

/**
 * Validates all Polaris icon imports to prevent runtime errors
 * Run this before any deployment
 */

const fs = require('fs');
const path = require('path');

// Known valid Polaris icon patterns
const VALID_ICON_PATTERNS = [
  /Major$/,      // e.g., HomeMajor, AnalyticsMajor
  /Minor$/,      // e.g., ChevronLeftMinor
  /Icon$/,       // Some legacy icons still use Icon suffix
  /Filled$/,     // e.g., HeartFilled
];

// Common incorrect icon names and their corrections
const ICON_CORRECTIONS = {
  'TrendingUpIcon': 'AnalyticsMajor',
  'RefreshIcon': 'RefreshMajor',
  'TeamIcon': 'CustomersMajor',
  'AutomationIcon': 'AutomationMajor',
  'ChevronRightIcon': 'ChevronRightMinor',
  'ChevronLeftIcon': 'ChevronLeftMinor',
  'SearchIcon': 'SearchMinor',
  'SettingsIcon': 'SettingsMajor',
  'HomeIcon': 'HomeMajor',
  'ProductsIcon': 'ProductsMajor',
  'OrdersIcon': 'OrdersMajor',
  'CustomersIcon': 'CustomersMajor',
  'AnalyticsIcon': 'AnalyticsMajor',
  'MarketingIcon': 'MarketingMajor',
  'DiscountsIcon': 'DiscountsMajor',
  'AppsIcon': 'AppsMajor'
};

let errorsFound = 0;
let filesChecked = 0;

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.relative(process.cwd(), filePath);
  filesChecked++;
  
  // Check for Polaris icon imports
  const importRegex = /import\s*{([^}]+)}\s*from\s*['"]@shopify\/polaris-icons['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const imports = match[1].split(',').map(i => i.trim());
    
    for (const iconImport of imports) {
      // Skip if it's a valid pattern
      const isValid = VALID_ICON_PATTERNS.some(pattern => pattern.test(iconImport));
      
      if (!isValid) {
        console.error(`❌ ERROR in ${fileName}:`);
        console.error(`   Invalid icon import: ${iconImport}`);
        
        if (ICON_CORRECTIONS[iconImport]) {
          console.error(`   ✓ Suggested fix: ${ICON_CORRECTIONS[iconImport]}`);
        } else {
          console.error(`   ℹ️  Icon names should end with Major, Minor, Icon, or Filled`);
        }
        
        errorsFound++;
      }
    }
  }
  
  // Also check for direct icon usage
  const iconUsageRegex = /<Icon\s+source={([^}]+)}/g;
  while ((match = iconUsageRegex.exec(content)) !== null) {
    const iconName = match[1].trim();
    
    // Check if it's using an incorrect name
    if (ICON_CORRECTIONS[iconName]) {
      console.error(`❌ ERROR in ${fileName}:`);
      console.error(`   Invalid icon usage: <Icon source={${iconName}} />`);
      console.error(`   ✓ Suggested fix: <Icon source={${ICON_CORRECTIONS[iconName]}} />`);
      errorsFound++;
    }
  }
}

function validateDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.startsWith('.')) {
      validateDirectory(fullPath);
    } else if (stat.isFile() && (file.endsWith('.tsx') || file.endsWith('.jsx'))) {
      checkFile(fullPath);
    }
  }
}

console.log('🔍 Validating Polaris icon imports...\n');

// Check the sosv02 app directory
const appDir = path.join(__dirname, 'apps/sosv02/web');
if (fs.existsSync(appDir)) {
  validateDirectory(appDir);
} else {
  console.error('❌ Could not find apps/sosv02/web directory');
  process.exit(1);
}

console.log(`\n✅ Checked ${filesChecked} files`);

if (errorsFound === 0) {
  console.log('✅ All Polaris icon imports are valid!');
  process.exit(0);
} else {
  console.error(`\n❌ Found ${errorsFound} icon import errors`);
  console.error('Fix these errors before deployment to prevent runtime crashes');
  process.exit(1);
}