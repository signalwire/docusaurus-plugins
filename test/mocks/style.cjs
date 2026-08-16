/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Stands in for CSS modules under Jest. Returns the requested key as its own
// class name, so `styles.copyButton` renders as "copyButton" and assertions can
// target it without depending on the real hashed class names.
module.exports = new Proxy(
  {},
  {
    get: (_target, key) => (key === '__esModule' ? false : String(key)),
  }
);
