#!/usr/bin/env tsx

/**
 * Comprehensive Test Runner for AssetTag Application
 *
 * This script runs all unit tests for the main application components:
 * - Sites (Sites, SiteDetails, CreateSite)
 * - Live Map (AssetMap)
 * - Dashboard
 * - Maintenance
 * - Vehicle Asset Pairing
 *
 * Usage:
 *   npm run test:all
 *   or
 *   tsx src/test/run-all-tests.ts
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const TEST_DIR = path.join(__dirname, '../components/__tests__');
const TEST_FILES = [
  'Sites.test.tsx',
  'SiteDetails.test.tsx',
  'CreateSite.test.tsx',
  'AssetMap.test.tsx',
  'Dashboard.test.tsx',
  'Maintenance.test.tsx',
  'VehicleAssetPairing.test.tsx',
  'IssueDetails.test.tsx',
  'IssueTracking.test.tsx',
  'JobManagement.test.tsx',
];

interface TestResult {
  file: string;
  status: 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
}

class TestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  async runAllTests(): Promise<void> {
    console.log(
      '🚀 Starting comprehensive test suite for AssetTag Application\n'
    );
    this.startTime = Date.now();

    // Check if test directory exists
    if (!existsSync(TEST_DIR)) {
      console.error(`❌ Test directory not found: ${TEST_DIR}`);
      process.exit(1);
    }

    // Run each test file
    for (const testFile of TEST_FILES) {
      await this.runTestFile(testFile);
    }

    this.printSummary();
  }

  private async runTestFile(testFile: string): Promise<void> {
    const testPath = path.join(TEST_DIR, testFile);

    if (!existsSync(testPath)) {
      console.log(`⏭️  Skipping ${testFile} - file not found`);
      this.results.push({
        file: testFile,
        status: 'skipped',
      });
      return;
    }

    console.log(`🧪 Running ${testFile}...`);
    const startTime = Date.now();

    try {
      // Run the test file using vitest
      execSync(`npx vitest run ${testPath} --reporter=verbose`, {
        stdio: 'inherit',
        cwd: process.cwd(),
      });

      const duration = Date.now() - startTime;
      console.log(`✅ ${testFile} passed (${duration}ms)\n`);

      this.results.push({
        file: testFile,
        status: 'passed',
        duration,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`❌ ${testFile} failed (${duration}ms)\n`);

      this.results.push({
        file: testFile,
        status: 'failed',
        duration,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private printSummary(): void {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const total = this.results.length;

    console.log('📊 Test Summary');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    console.log('='.repeat(50));

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => r.status === 'failed')
        .forEach(result => {
          console.log(`  - ${result.file}: ${result.error}`);
        });
    }

    if (skipped > 0) {
      console.log('\n⏭️  Skipped Tests:');
      this.results
        .filter(r => r.status === 'skipped')
        .forEach(result => {
          console.log(`  - ${result.file}`);
        });
    }

    console.log('\n📋 Test Coverage by Component:');
    console.log('='.repeat(50));

    const componentTests = {
      Sites: ['Sites.test.tsx', 'SiteDetails.test.tsx', 'CreateSite.test.tsx'],
      'Live Map': ['AssetMap.test.tsx'],
      Dashboard: ['Dashboard.test.tsx'],
      Maintenance: ['Maintenance.test.tsx'],
      'Vehicle Pairing': ['VehicleAssetPairing.test.tsx'],
      Issues: ['IssueDetails.test.tsx', 'IssueTracking.test.tsx'],
      Jobs: ['JobManagement.test.tsx'],
    };

    Object.entries(componentTests).forEach(([component, tests]) => {
      const componentResults = this.results.filter(r => tests.includes(r.file));
      const componentPassed = componentResults.filter(
        r => r.status === 'passed'
      ).length;
      const componentTotal = componentResults.length;
      const status =
        componentTotal === 0
          ? '⏭️'
          : componentPassed === componentTotal
            ? '✅'
            : '❌';

      console.log(
        `${status} ${component}: ${componentPassed}/${componentTotal} tests passed`
      );
    });

    console.log('\n🎯 Test Quality Metrics:');
    console.log('='.repeat(50));
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    console.log(
      `Average Test Duration: ${(this.results.reduce((sum, r) => sum + (r.duration || 0), 0) / total).toFixed(0)}ms`
    );

    if (failed === 0) {
      console.log(
        '\n🎉 All tests passed! The application components are working correctly.'
      );
    } else {
      console.log(
        `\n⚠️  ${failed} test(s) failed. Please review and fix the issues.`
      );
      process.exit(1);
    }
  }
}

// Run the tests
async function main() {
  const runner = new TestRunner();
  await runner.runAllTests();
}

// Handle uncaught errors
process.on('uncaughtException', error => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', reason => {
  console.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

// Run if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test runner failed:', error.message);
    process.exit(1);
  });
}

export { TestRunner };
