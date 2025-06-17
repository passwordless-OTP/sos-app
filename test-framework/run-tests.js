#!/usr/bin/env node

const FunctionalTests = require('./functional-tests');
const fs = require('fs');
const path = require('path');

async function runTests() {
  console.log('🚀 SOS App Automated Testing');
  console.log('============================\n');
  
  // Check if browser profile exists
  const profilePath = path.join(__dirname, '..', '.browser-profiles', 'chrome-persistent');
  if (!fs.existsSync(profilePath)) {
    console.error('❌ Browser profile not found. Please run browser-config.js first to set up login.');
    process.exit(1);
  }
  
  // Run options
  const options = {
    headless: process.argv.includes('--headless'),
    record: process.argv.includes('--record'),
    specific: process.argv.find(arg => arg.startsWith('--test='))
  };
  
  if (options.headless) {
    process.env.HEADLESS = 'true';
    console.log('Running in headless mode\n');
  }
  
  if (options.record) {
    process.env.RECORD = 'true';
    console.log('Recording videos of tests\n');
  }
  
  // Run tests
  const tests = new FunctionalTests();
  
  try {
    if (options.specific) {
      const testName = options.specific.split('=')[1];
      console.log(`Running specific test: ${testName}\n`);
      // Add logic for specific test execution
    } else {
      await tests.runAll();
    }
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}

// Show usage
if (process.argv.includes('--help')) {
  console.log(`
Usage: node run-tests.js [options]

Options:
  --headless    Run tests without showing browser
  --record      Record videos of test execution
  --test=NAME   Run specific test
  --help        Show this help message

Examples:
  node run-tests.js                    # Run all tests with browser visible
  node run-tests.js --headless         # Run in background
  node run-tests.js --test=ai          # Run only AI tests
  `);
  process.exit(0);
}

runTests();