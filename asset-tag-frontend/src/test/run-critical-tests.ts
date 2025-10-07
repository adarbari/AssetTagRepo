#!/usr/bin/env tsx

/**
 * Critical Test Runner for CI/CD Pipeline
 * 
 * This script runs only the most critical tests that are essential for
 * basic functionality verification. It's designed to run quickly in CI.
 * 
 * Usage:
 *   npm run test:critical
 *   or
 *   tsx src/test/run-critical-tests.ts
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

// Only run the most critical tests for CI
const CRITICAL_TEST_FILES = [
  'src/components/__tests__/Dashboard.test.tsx',
  'src/components/__tests__/AssetInventory.test.tsx',
  'src/components/__tests__/Sites.test.tsx',
  'src/components/__tests__/CreateSite.test.tsx',
  'src/components/__tests__/Maintenance.test.tsx',
  'src/components/__tests__/VehicleAssetPairing.test.tsx',
  'src/components/__tests__/IssueDetails.test.tsx',
  'src/components/__tests__/JobManagement.test.tsx',
  'src/hooks/__tests__/useAsyncData.test.ts',
  'src/services/__tests__/api.test.ts',
  'src/utils/__tests__/errorHandler.test.ts',
];

interface TestResult {
  file: string;
  status: 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
}

class CriticalTestRunner {
  private results: TestResult[] = [];
  private startTime: number = 0;

  async runCriticalTests(): Promise<void> {
    console.log('🚀 Running critical tests for CI/CD pipeline\n');
    this.startTime = Date.now();

    // Run each critical test file
    for (const testFile of CRITICAL_TEST_FILES) {
      await this.runTestFile(testFile);
    }

    this.printSummary();
  }

  private async runTestFile(testFile: string): Promise<void> {
    const testPath = path.join(process.cwd(), testFile);

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
      // Run the test file using vitest with optimized settings
      execSync(`npx vitest run ${testPath} --reporter=verbose --config=vitest.config.ci.ts`, {
        stdio: 'inherit',
        cwd: process.cwd(),
        timeout: 30000, // 30 second timeout per test file
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

    console.log('📊 Critical Test Summary');
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

    console.log('\n🎯 Test Quality Metrics:');
    console.log('='.repeat(50));
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
    console.log(
      `Average Test Duration: ${(this.results.reduce((sum, r) => sum + (r.duration || 0), 0) / total).toFixed(0)}ms`
    );

    if (failed === 0) {
      console.log(
        '\n🎉 All critical tests passed! The application core functionality is working correctly.'
      );
    } else {
      console.log(
        `\n⚠️  ${failed} critical test(s) failed. Please review and fix the issues.`
      );
      process.exit(1);
    }
  }
}

// Run the tests
async function main() {
  const runner = new CriticalTestRunner();
  await runner.runCriticalTests();
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
    console.error('❌ Critical test runner failed:', error.message);
    process.exit(1);
  });
}

export { CriticalTestRunner };
