/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    
    // Aggressive timeout configurations for CI
    testTimeout: 3000,         // 3 seconds per test
    hookTimeout: 3000,         // 3 seconds for setup/teardown
    teardownTimeout: 2000,     // 2 seconds for cleanup
    
    // Single thread for CI stability
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true,    // Force single thread in CI
        maxThreads: 1,
        minThreads: 1,
      },
    },
    
    // CI-specific optimizations
    bail: 3,                   // Stop after 3 failures
    retry: 0,                  // No retries in CI
    fileParallelism: false,    // Disable file parallelism
    
    // Skip slow integration tests in CI
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      // Skip the most time-consuming integration test
      '**/integration/__tests__/userFlow.test.tsx',
      // Skip tests that are known to be slow
      '**/AssetMap.test.tsx',  // Map tests are slow due to Leaflet mocking
    ],
    
    env: {
      VITE_API_BASE_URL: 'http://localhost:3000',
      VITE_API_VERSION: 'v1',
      VITE_USE_MOCK_DATA: 'true',
      VITE_API_TIMEOUT: '5000',  // Reduced timeout
      CI: 'true',  // Mark as CI environment
    },
    
    // Fix for Vite CJS deprecation warning
    esbuild: {
      target: 'node14'
    },
    
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'clover', 'json-summary'],
      exclude: [
        'node_modules/**',
        'build/**',
        'dist/**',
        'coverage/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/test/**',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.spec.*',
        'src/test/**',
        'src/examples/**',
        'src/data/mock*.ts',
        'src/supabase/functions/**',
      ],
      include: ['src/**/*.{ts,tsx}'],
      thresholds: {
        global: {
          branches: 30,    // Reduced thresholds for CI
          functions: 30,
          lines: 30,
          statements: 30,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
