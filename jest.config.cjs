/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
      transpilation: true,
    }],
  },
  moduleFileExtensions: ['ts', 'js'],
  collectCoverageFrom: [
    'packages/*/src/**/*.ts',
    '!packages/*/src/**/*.d.ts',
  ],
  // Ignore development and website directories with conflicting package.json
  testPathIgnorePatterns: [
    '/node_modules/',
    '/development/',
    '/website/',
    '/lib/',
  ],
  modulePathIgnorePatterns: [
    '/development/',
    '/lib/',
  ],
  // Set up Jest globals
  setupFilesAfterEnv: [],
};