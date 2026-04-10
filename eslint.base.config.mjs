import nx from '@nx/eslint-plugin';
import noInlineStorageKeys from './scripts/eslint-rules/no-inline-storage-keys.js';

/** Local ESLint plugin that bundles project-specific rules. */
const localPlugin = {
  rules: {
    'no-inline-storage-keys': noInlineStorageKeys,
  },
};

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: ['**/dist'],
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts', '**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
    // Override or add rules here
    rules: {},
  },
  // ── Local storage key enforcement ────────────────────────────────────────
  {
    files: ['**/*.ts', '**/*.js'],
    ignores: ['**/local-storage-keys.ts', '**/local-storage.service.ts', 'scripts/**'],
    plugins: { local: localPlugin },
    rules: {
      'local/no-inline-storage-keys': 'error',
    },
  },
];
