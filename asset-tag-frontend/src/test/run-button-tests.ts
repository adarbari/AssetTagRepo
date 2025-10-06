#!/usr/bin/env node

/**
 * Button Click Test Runner
 *
 * This script runs all button click tests and provides a summary
 * of test results, focusing on button functionality validation.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
// import path from 'path';

const _TEST_PATTERNS = [
  '**/__tests__/**/*.test.tsx',
  '**/__tests__/**/*.test.ts',
];

const BUTTON_TEST_FILES = [
  'src/components/__tests__/IssueDetails.test.tsx',
  'src/components/__tests__/IssueTracking.test.tsx',
  'src/components/__tests__/JobManagement.test.tsx',
  'src/components/common/__tests__/PageHeader.test.tsx',
  'src/components/common/__tests__/EmptyState.test.tsx',
  'src/components/ui/__tests__/button.test.tsx',
];

function runTests() {
// // // // // // console.log('🧪 Running Button Click Tests...\n');

  // Check if test files exist
  const missingFiles = BUTTON_TEST_FILES.filter(file => !existsSync(file));
  if (missingFiles.length > 0) {
// // // // // // console.warn('⚠️  Missing test files:');
    missingFiles.forEach(file => // // // // // console.warn(`   - ${file}`));
// // // // // // console.log();
  }

  try {
    // Run all tests
// // // // // // console.log('📋 Running all button click tests...');
    execSync('npm run test:run', {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

// // // // // // console.log('\n✅ All button click tests completed successfully!');
// // // // // // console.log('\n📊 Test Summary:');
// // // // // // console.log('   - IssueDetails: Back, Edit, Save, Cancel buttons');
// // // // // // console.log('   - IssueTracking: Search, Filter, Tab, Dropdown actions');
// // // // // // console.log('   - JobManagement: Create, Delete, View, Filter buttons');
// // // // // // console.log('   - PageHeader: Back button, Action buttons');
// // // // // // console.log('   - EmptyState: Action buttons');
// // // // // // console.log('   - Button: All variants, sizes, and interactions');
  } catch (error) {
// // // // // // console.error('\n❌ Some tests failed!');
// // // // // // console.error('Please check the test output above for details.');
    process.exit(1);
  }
}

function runSpecificTest(file: string) {
  if (!existsSync(file)) {
// // // // // // console.error(`❌ Test file not found: ${file}`);
    process.exit(1);
  }

// // // // // // console.log(`🧪 Running specific test: ${file}\n`);

  try {
    execSync(`npx vitest run ${file}`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
// // // // // // console.log(`\n✅ Test completed: ${file}`);
  } catch (error) {
// // // // // // console.error(`\n❌ Test failed: ${file}`);
    process.exit(1);
  }
}

function showHelp() {
// // // // // // console.log(`
🧪 Button Click Test Runner

Usage:
  npm run test:buttons                    # Run all button tests
  npm run test:buttons -- <file>          # Run specific test file
  npm run test:buttons -- --help          # Show this help

Available test files:
${BUTTON_TEST_FILES.map(file => `  - ${file}`).join('\n')}

Examples:
  npm run test:buttons -- src/components/__tests__/IssueDetails.test.tsx
  npm run test:buttons -- src/components/ui/__tests__/button.test.tsx
`);
}

// Main execution
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  showHelp();
  process.exit(0);
}

if (args.length > 0) {
  const testFile = args[0];
  runSpecificTest(testFile);
} else {
  runTests();
}
