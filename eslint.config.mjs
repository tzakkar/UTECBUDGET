import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

// Flat ESLint config (Next.js recommended). See:
// https://nextjs.org/docs/basic-features/eslint#disabling-rules

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    rules: {
      // Relax noisy rules
      'react-hooks/exhaustive-deps': 'off',
    },
    linterOptions: {
      // Keep .next, build artifacts ignored
      reportUnusedDisableDirectives: true,
    },
  },
  // Override default ignores of eslint-config-next plus keep build outputs ignored
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  // Targeted overrides for server route handlers and scripts
  {
    files: [
      'app/api/**/*.ts',
      'scripts/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },
])


