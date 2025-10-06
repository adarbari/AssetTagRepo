/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    env: {
      VITE_API_BASE_URL: 'http://localhost:3000',
      VITE_API_VERSION: 'v1',
      VITE_USE_MOCK_DATA: 'true',
      VITE_API_TIMEOUT: '30000',
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
        'src/data/mock*.ts', // Exclude mock data files
        'src/supabase/functions/**', // Exclude server functions
      ],
      include: ['src/**/*.{ts,tsx}'],
      thresholds: {
        global: {
          branches: 50,
          functions: 50,
          lines: 50,
          statements: 50,
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
