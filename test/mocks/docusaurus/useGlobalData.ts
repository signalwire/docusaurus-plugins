/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Stands in for `@docusaurus/useGlobalData`.
const store = new Map<string, unknown>();

/** Test helper: set the global data a plugin will report. */
export function __setPluginData(pluginName: string, data: unknown): void {
  store.set(pluginName, data);
}

/** Test helper: clear all plugin global data. */
export function __reset(): void {
  store.clear();
}

export function usePluginData(pluginName: string): unknown {
  return store.get(pluginName);
}

export default function useGlobalData(): Record<string, unknown> {
  return Object.fromEntries(store);
}
