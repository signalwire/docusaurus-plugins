/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import path from 'path';

import type { Plugin } from '@docusaurus/types';

export { default as getSwizzleConfig } from './getSwizzleConfig';

export default function themeLlmsTxt(): Plugin<void> {
  return {
    name: 'docusaurus-theme-llms-txt',

    getThemePath(): string {
      return path.join(__dirname, '..', 'lib', 'theme');
    },

    getTypeScriptThemePath(): string {
      return path.resolve(__dirname, '..', 'src', 'theme');
    },
  };
}
