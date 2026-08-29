/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';

import * as ExecutionEnvironment from './mocks/docusaurus/ExecutionEnvironment';
import * as router from './mocks/docusaurus/router';
import * as themeCommon from './mocks/docusaurus/theme-common';
import * as useBaseUrl from './mocks/docusaurus/useBaseUrl';
import * as useGlobalData from './mocks/docusaurus/useGlobalData';

// The Docusaurus stand-ins hold module-level state so tests can drive them.
// Reset it between tests so ordering never affects results.
afterEach(() => {
  cleanup();
  router.__reset();
  useBaseUrl.__reset();
  useGlobalData.__reset();
  themeCommon.__reset();
  ExecutionEnvironment.default.canUseDOM = true;
});
