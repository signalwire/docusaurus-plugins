/**
 *
 * /**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @signalwire/docusaurus-theme-llms-txt
 *
 * Docusaurus theme package providing UI components for llms-txt functionality.
 * This theme works in conjunction with @signalwire/docusaurus-plugin-llms-txt
 * to provide copy page button functionality and other llms-txt related UI components.
 */

// This file, like all the other ambient declaration files for theme packages, is
// needed for TS to understand our `@theme` aliases. The @theme/* module declarations
// are provided by the @signalwire/docusaurus-plugin-llms-txt package, following
// the same pattern as docusaurus-openapi-docs.

declare module '@signalwire/docusaurus-theme-llms-txt' {
  import type { LoadContext, Plugin, PluginModule } from '@docusaurus/types';

  export type ThemeOptions = {};

  export type Options = {};

  export const getSwizzleConfig: PluginModule['getSwizzleConfig'];

  export default function themeLlmsTxt(
    context: LoadContext,
    options: Options
  ): Plugin<undefined>;
}
