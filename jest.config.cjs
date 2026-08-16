/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const THEME_SRC = '<rootDir>/packages/docusaurus-theme-llms-txt/src';

/**
 * `@docusaurus/*` and `@theme/*` are webpack aliases injected by
 * @docusaurus/core at build time, so nothing resolves them under Jest.
 * `@theme/*` maps onto the theme's real sources (that IS our code under test);
 * the `@docusaurus/*` entries map onto hand-written stand-ins in test/mocks.
 */
const themeModuleNameMapper = {
  '\\.(css|scss|sass)$': '<rootDir>/test/mocks/style.cjs',

  '^@docusaurus/router$': '<rootDir>/test/mocks/docusaurus/router.ts',
  '^@docusaurus/ExecutionEnvironment$':
    '<rootDir>/test/mocks/docusaurus/ExecutionEnvironment.ts',
  '^@docusaurus/useBaseUrl$': '<rootDir>/test/mocks/docusaurus/useBaseUrl.ts',
  '^@docusaurus/useGlobalData$':
    '<rootDir>/test/mocks/docusaurus/useGlobalData.ts',
  '^@docusaurus/Translate$': '<rootDir>/test/mocks/docusaurus/Translate.tsx',
  '^@docusaurus/theme-common$':
    '<rootDir>/test/mocks/docusaurus/theme-common.ts',

  '^@theme/(.*)$': `${THEME_SRC}/theme/$1`,
};

const tsTransform = {
  '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
};

const common = {
  rootDir: __dirname,
  transform: tsTransform,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // Lets tests inside packages/ reach the shared harness without a relative
  // path that climbs out of their own package.
  moduleNameMapper: { '^@test/(.*)$': '<rootDir>/test/$1' },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/development/',
    '/website/',
    '/lib/',
  ],
  modulePathIgnorePatterns: ['/development/', '/lib/'],
};

module.exports = {
  projects: [
    {
      ...common,
      displayName: 'monorepo',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
    },
    {
      ...common,
      displayName: 'plugin',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/packages/docusaurus-plugin-llms-txt/**/__tests__/**/*.test.ts',
      ],
    },
    {
      // The theme is React code, so it needs a DOM. This project is what makes
      // the React 18-vs-19 CI matrix meaningful -- without it, a React major
      // bump is verified by nothing but `tsc`.
      ...common,
      displayName: 'theme',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/packages/docusaurus-theme-llms-txt/**/__tests__/**/*.test.{ts,tsx}',
      ],
      moduleNameMapper: {
        ...common.moduleNameMapper,
        ...themeModuleNameMapper,
      },
      setupFilesAfterEnv: ['<rootDir>/test/setup-theme.ts'],
    },
  ],
  collectCoverageFrom: [
    'packages/*/src/**/*.{ts,tsx}',
    '!packages/*/src/**/*.d.ts',
    // Tests live beside the code they cover, so without this they count as
    // production source: every new spec file would lower reported coverage.
    '!packages/*/src/**/__tests__/**',
  ],
};
