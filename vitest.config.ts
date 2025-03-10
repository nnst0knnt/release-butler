import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/build**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'build/**',
        '**/[.]**',
        '*/test?(s)/**',
        '**/*.d.ts',
        '**/vitest.config.*',
        '**/.{eslint,prettier}rc.{js,mjs,cjs,yml}'
      ]
    }
  }
});
