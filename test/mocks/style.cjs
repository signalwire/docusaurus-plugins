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
    get: (_target, key) => {
      // Symbol keys must fall through as undefined. Returning a string for
      // Symbol.toPrimitive makes any coercion of the module -- a template
      // literal, String(styles), a snapshot serializer -- throw "is not a
      // function", which reads as a bug anywhere but here.
      if (typeof key === 'symbol') {
        return undefined;
      }
      return key === '__esModule' ? false : key;
    },
  }
);
