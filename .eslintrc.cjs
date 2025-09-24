/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const OFF = 0;
const WARNING = 1;
const ERROR = 2;

module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    jest: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  globals: {
    JSX: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react-hooks/recommended',
    'plugin:jest/recommended',
    'airbnb',
    'plugin:@typescript-eslint/recommended',
    'plugin:regexp/recommended',
    'prettier',
    'plugin:@docusaurus/all',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    react: {
      version: 'detect',
    },
  },
  reportUnusedDisableDirectives: true,
  plugins: [
    'react-compiler',
    'react-hooks',
    'header',
    'jest',
    '@typescript-eslint',
    'regexp',
    '@docusaurus',
    'import',
    'jsx-a11y',
    'react',
  ],
  rules: {
    'react-compiler/react-compiler': ERROR,
    // React JSX Transform
    'react/jsx-uses-react': OFF,
    'react/react-in-jsx-scope': OFF,

    // General Rules
    'array-callback-return': WARNING,
    camelcase: WARNING,
    'class-methods-use-this': OFF,
    curly: [WARNING, 'all'],
    'global-require': WARNING,
    'lines-between-class-members': OFF,
    'max-classes-per-file': OFF,
    'max-len': [
      WARNING,
      {
        code: Infinity, // Prettier handles code width
        tabWidth: 2,
        comments: 80,
        ignoreUrls: true,
        ignorePattern: '(eslint-disable|@)',
      },
    ],
    'arrow-body-style': OFF,
    'no-await-in-loop': OFF,
    'no-case-declarations': WARNING,
    'no-console': OFF, // Aligned with Docusaurus policy
    'no-constant-binary-expression': ERROR,
    'no-continue': OFF,
    'no-control-regex': WARNING,
    'no-else-return': OFF,
    'no-empty': [WARNING, { allowEmptyCatch: true }],
    'no-lonely-if': WARNING,
    'no-nested-ternary': WARNING,
    'no-param-reassign': [WARNING, { props: false }],
    'no-prototype-builtins': WARNING,
    'no-restricted-exports': OFF,
    'no-template-curly-in-string': WARNING,
    'no-unused-expressions': [
      WARNING,
      { allowTaggedTemplates: true, allowShortCircuit: true },
    ],
    'no-useless-escape': WARNING,
    'no-void': [ERROR, { allowAsStatement: true }],
    'prefer-destructuring': OFF,
    'prefer-named-capture-group': WARNING,
    'prefer-template': WARNING,
    'prefer-const': ERROR,
    'no-var': ERROR,
    yoda: WARNING,

    'no-restricted-properties': [
      ERROR,
      .../** @type {[string, string][]} */ ([
        // Prevent lodash usage, promoting native JS methods
        ['concat', 'Array#concat'],
        ['drop', 'Array#slice(n)'],
        ['dropRight', 'Array#slice(0, -n)'],
        ['fill', 'Array#fill'],
        ['filter', 'Array#filter'],
        ['find', 'Array#find'],
        ['findIndex', 'Array#findIndex'],
        ['first', 'foo[0]'],
        ['flatten', 'Array#flat'],
        ['flattenDeep', 'Array#flat(Infinity)'],
        ['flatMap', 'Array#flatMap'],
        ['fromPairs', 'Object.fromEntries'],
        ['head', 'foo[0]'],
        ['indexOf', 'Array#indexOf'],
        ['initial', 'Array#slice(0, -1)'],
        ['join', 'Array#join'],
        ['map', 'Array#map'],
        ['reduce', 'Array#reduce'],
        ['reverse', 'Array#reverse'],
        ['slice', 'Array#slice'],
        ['take', 'Array#slice(0, n)'],
        ['takeRight', 'Array#slice(-n)'],
        ['tail', 'Array#slice(1)'],
      ]).map(([property, alternative]) => ({
        object: '_',
        property,
        message: `Use ${alternative} instead.`,
      })),
      // Prevent sync fs methods
      ...[
        'readdirSync',
        'readFileSync',
        'statSync',
        'lstatSync',
        'existsSync',
        'pathExistsSync',
        'realpathSync',
        'mkdirSync',
        'mkdirpSync',
        'mkdirsSync',
        'writeFileSync',
        'writeJsonSync',
        'outputFileSync',
        'outputJsonSync',
        'moveSync',
        'copySync',
        'copyFileSync',
        'ensureFileSync',
        'ensureDirSync',
        'ensureLinkSync',
        'ensureSymlinkSync',
        'unlinkSync',
        'removeSync',
        'emptyDirSync',
      ].map((property) => ({
        object: 'fs',
        property,
        message: 'Do not use sync fs methods.',
      })),
    ],
    'no-restricted-syntax': [
      WARNING,
      // Copied from airbnb, removed for...of statement, added export all
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message:
          'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message:
          '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
      {
        selector: 'ExportAllDeclaration',
        message:
          "Export all does't work well if imported in ESM due to how they are transpiled, and they can also lead to unexpected exposure of internal methods.",
      },
    ],
    // Disable sort-keys as it's not critical
    'sort-keys': OFF,

    // File Header
    'header/header': [
      ERROR,
      'block',
      [
        '*',
        ' * Copyright (c) SignalWire, Inc. and its affiliates.',
        ' *',
        ' * This source code is licensed under the MIT license found in the',
        ' * LICENSE file in the root directory of this source tree.',
        ' ',
      ],
    ],

    // Import Rules
    'import/extensions': OFF,
    'import/no-extraneous-dependencies': OFF, // Temporarily disabled due to minimatch issue
    'import/no-unresolved': [
      OFF,
      {
        ignore: ['^@theme', '^@docusaurus', '^@generated', '^@site'],
      },
    ],
    'import/order': [
      WARNING,
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
          'type',
        ],
        pathGroups: [
          // CSS imports last
          {
            pattern: '*.+(css|sass|less|scss|pcss|styl)',
            group: 'unknown',
            patternOptions: { matchBase: true },
            position: 'after',
          },
          // React first
          { pattern: 'react', group: 'builtin', position: 'before' },
          { pattern: 'react-dom', group: 'builtin', position: 'before' },
          { pattern: 'react-dom/**', group: 'builtin', position: 'before' },
          // Common libraries
          { pattern: 'clsx', group: 'external', position: 'before' },
          // Theme imports
          { pattern: '@theme/**', group: 'internal' },
          { pattern: '@site/**', group: 'internal' },
          { pattern: '@theme-init/**', group: 'internal' },
          { pattern: '@theme-original/**', group: 'internal' },
        ],
        pathGroupsExcludedImportTypes: [],
        warnOnUnassignedImports: true,
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/prefer-default-export': OFF,
    'import/no-duplicates': ERROR,

    // Jest Rules
    'jest/consistent-test-it': WARNING,
    'jest/expect-expect': OFF,
    'jest/no-large-snapshots': [
      WARNING,
      { maxSize: Infinity, inlineMaxSize: 50 },
    ],
    'jest/no-test-return-statement': ERROR,
    'jest/prefer-expect-resolves': WARNING,
    'jest/prefer-lowercase-title': [WARNING, { ignore: ['describe'] }],
    'jest/prefer-spy-on': WARNING,
    'jest/prefer-to-be': WARNING,
    'jest/prefer-to-have-length': WARNING,
    'jest/require-top-level-describe': ERROR,
    'jest/valid-title': [
      ERROR,
      {
        mustNotMatch: {
          it: [
            '^should|\\.$',
            'Titles should not begin with "should" or end with a full-stop',
          ],
        },
      },
    ],

    // React Hooks Rules
    'react-hooks/rules-of-hooks': ERROR,
    'react-hooks/exhaustive-deps': ERROR,

    // React Rules
    'react/destructuring-assignment': OFF,
    'react/function-component-definition': [
      WARNING,
      {
        namedComponents: 'function-declaration',
        unnamedComponents: 'arrow-function',
      },
    ],
    'react/jsx-filename-extension': OFF,
    'react/jsx-key': [ERROR, { checkFragmentShorthand: true }],
    'react/jsx-no-useless-fragment': [ERROR, { allowExpressions: true }],
    'react/jsx-props-no-spreading': OFF,
    'react/no-array-index-key': OFF, // Static site generation
    'react/no-unstable-nested-components': [WARNING, { allowAsProps: true }],
    'react/prefer-stateless-function': WARNING,
    'react/prop-types': OFF,
    'react/require-default-props': [
      ERROR,
      { ignoreFunctionalComponents: true },
    ],

    // Accessibility Rules
    'jsx-a11y/click-events-have-key-events': WARNING,
    'jsx-a11y/no-noninteractive-element-interactions': WARNING,
    'jsx-a11y/html-has-lang': OFF,

    // TypeScript Rules
    '@typescript-eslint/consistent-type-definitions': OFF,
    '@typescript-eslint/require-await': OFF,
    '@typescript-eslint/ban-ts-comment': [
      ERROR,
      { 'ts-expect-error': 'allow-with-description' },
    ],
    '@typescript-eslint/consistent-indexed-object-style': OFF,
    '@typescript-eslint/consistent-type-imports': [
      WARNING,
      { disallowTypeAnnotations: false },
    ],
    '@typescript-eslint/explicit-module-boundary-types': WARNING,
    '@typescript-eslint/method-signature-style': ERROR,
    '@typescript-eslint/no-empty-function': OFF,
    '@typescript-eslint/no-empty-interface': [
      ERROR,
      { allowSingleExtends: true },
    ],
    '@typescript-eslint/no-inferrable-types': OFF,
    '@typescript-eslint/no-namespace': [WARNING, { allowDeclarations: true }],
    'no-use-before-define': OFF,
    '@typescript-eslint/no-use-before-define': [
      ERROR,
      { functions: false, classes: false, variables: true },
    ],
    '@typescript-eslint/no-non-null-assertion': OFF,
    'no-redeclare': OFF,
    '@typescript-eslint/no-redeclare': ERROR,
    'no-shadow': OFF,
    '@typescript-eslint/no-shadow': ERROR,
    'no-unused-vars': OFF,
    '@typescript-eslint/no-unused-vars': [
      ERROR,
      {
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@docusaurus/no-html-links': ERROR,
    '@docusaurus/prefer-docusaurus-heading': ERROR,
    '@docusaurus/no-untranslated-text': [
      WARNING,
      {
        ignoredStrings: [
          '·',
          '-',
          '—',
          '×',
          '​', // zwj: &#8203;
          '@',
          'SignalWire',
          'GitHub',
        ],
      },
    ],
    // Note: removed type-checking rules following Docusaurus pattern
    '@typescript-eslint/no-explicit-any': WARNING,
    '@typescript-eslint/no-var-requires': ERROR,
    '@typescript-eslint/prefer-as-const': ERROR,
    // Disable underscore dangle for internal properties
    'no-underscore-dangle': OFF,
  },
  overrides: [
    // Theme components
    {
      files: [
        'packages/*/src/theme/**/*.js',
        'packages/*/src/theme/**/*.ts',
        'packages/*/src/theme/**/*.tsx',
      ],
      excludedFiles: ['*.test.js', '*.test.ts', '*.test.tsx'],
      rules: {
        // Disable import restrictions for theme components as they need internal imports
        'no-restricted-imports': OFF,
        // Relaxed rules for theme components
        '@typescript-eslint/no-unused-vars': WARNING,
        '@typescript-eslint/no-explicit-any': WARNING,
      },
    },
    // Theme components should use default exports
    {
      files: ['packages/*/src/theme/**/*.tsx'],
      rules: {
        'import/no-named-export': WARNING,
      },
    },
    // TypeScript files
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-undef': OFF,
        'import/no-import-module-exports': OFF,
      },
    },
    // JavaScript files
    {
      files: ['*.js', '*.mjs', '*.cjs'],
      rules: {
        '@typescript-eslint/no-var-requires': OFF,
        '@typescript-eslint/explicit-module-boundary-types': OFF,
      },
    },
    // Test files and development scripts
    {
      files: [
        '*.test.js',
        '*.test.ts',
        '*.test.tsx',
        'scripts/**/*',
        'website/**/*',
        '__tests__/**/*',
      ],
      rules: {
        'header/header': OFF,
        '@docusaurus/no-untranslated-text': OFF,
        'import/no-extraneous-dependencies': OFF,
      },
    },
  ],
};
