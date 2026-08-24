/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Stands in for `@docusaurus/ExecutionEnvironment`. Defaults to a browser-like
// environment; flip `canUseDOM` to exercise the SSR guard.
const ExecutionEnvironment = {
  canUseDOM: true,
  canUseEventListeners: true,
  canUseIntersectionObserver: true,
  canUseViewport: true,
};

export default ExecutionEnvironment;
