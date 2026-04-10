/**
 * ESLint rule: local/no-inline-storage-keys
 *
 * Enforces that all localStorage keys are defined in
 * libs/util/src/lib/local-storage-keys.ts and NOT as inline string literals
 * or local constants elsewhere.
 *
 * Two sub-rules are applied:
 *
 *  1. String literals passed directly to localStorage service methods
 *     (getDataSync, setDataSync, getData, setData, removeData) or to the
 *     native browser API (localStorage.getItem / localStorage.setItem /
 *     localStorage.removeItem) are flagged.
 *
 *  2. Variable declarations whose name ends with _KEY (case-insensitive) and
 *     whose initialiser is a string literal are flagged when the file is NOT
 *     the canonical local-storage-keys.ts.
 */

'use strict';

const STORAGE_KEY_FILE = 'local-storage-keys.ts';

const SERVICE_METHODS = new Set([
  'getDataSync',
  'setDataSync',
  'getData',
  'setData',
  'removeData',
]);

const NATIVE_METHODS = new Set([
  'getItem',
  'setItem',
  'removeItem',
]);

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require all localStorage keys to be defined in local-storage-keys.ts, not as inline strings.',
      recommended: true,
    },
    schema: [],
    messages: {
      inlineKeyInCall:
        'Do not use an inline string as a localStorage key. ' +
        'Import the constant from libs/util/src/lib/local-storage-keys.ts instead.',
      localKeyConst:
        'Storage key "{{name}}" must be defined in local-storage-keys.ts, not in this file. ' +
        'Move it there and import it from @dn-d-servant/util.',
    },
  },

  create(context) {
    const filename = context.getFilename();

    // The canonical file is exempt from rule #2 (it IS the registry).
    const isKeyFile = filename.endsWith(STORAGE_KEY_FILE);

    return {
      // ── Rule 1: no inline strings in service / native localStorage calls ──
      CallExpression(node) {
        const { callee, arguments: args } = node;

        // LocalStorageService methods: this.foo.getDataSync('key', ...)
        if (
          callee.type === 'MemberExpression' &&
          callee.property.type === 'Identifier' &&
          SERVICE_METHODS.has(callee.property.name)
        ) {
          const firstArg = args[0];
          if (firstArg && firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
            context.report({ node: firstArg, messageId: 'inlineKeyInCall' });
          }
        }

        // Native browser API: localStorage.getItem('key')
        if (
          callee.type === 'MemberExpression' &&
          callee.object.type === 'Identifier' &&
          callee.object.name === 'localStorage' &&
          callee.property.type === 'Identifier' &&
          NATIVE_METHODS.has(callee.property.name)
        ) {
          const firstArg = args[0];
          if (firstArg && firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
            context.report({ node: firstArg, messageId: 'inlineKeyInCall' });
          }
        }
      },

      // ── Rule 2: no *_KEY string consts outside local-storage-keys.ts ──────
      VariableDeclarator(node) {
        if (isKeyFile) return;

        const { id, init } = node;
        if (
          id.type === 'Identifier' &&
          /_KEY$/i.test(id.name) &&
          init &&
          init.type === 'Literal' &&
          typeof init.value === 'string'
        ) {
          context.report({
            node,
            messageId: 'localKeyConst',
            data: { name: id.name },
          });
        }
      },
    };
  },
};

