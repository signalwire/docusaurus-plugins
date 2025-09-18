/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { SwizzleConfig } from '@docusaurus/types';

/**
 * Swizzle config for theme components
 * Based on Docusaurus patterns from:
 * https://github.com/facebook/docusaurus/blob/main/packages/docusaurus-theme-classic/src/getSwizzleConfig.ts
 */
export default function getSwizzleConfig(): SwizzleConfig {
  return {
    components: {
      CopyPageContent: {
        actions: {
          eject: 'unsafe',
          wrap: 'unsafe',
        },
        description:
          'Main copy page button component with complex state management, hooks, and global data dependencies. Swizzling is unsafe and may break functionality. Use CSS variables for styling customization instead.',
      },
      'CopyPageContent/CopyButton': {
        actions: {
          eject: 'unsafe',
          wrap: 'unsafe'
        },
        description:
          'Internal button component with complex state management and animations. Swizzling may break functionality. Use CSS variables for styling or swizzle the parent CopyPageContent instead.',
      },
      'CopyPageContent/DropdownMenu': {
        actions: {
          eject: 'unsafe',
          wrap: 'unsafe',
        },
        description:
          'Dropdown menu component with complex visibility state and animations. Swizzling is unsafe due to parent component dependencies. Use CSS variables for styling instead.',
      },
      'CopyPageContent/DropdownMenu/MenuItem': {
        actions: {
          eject: 'unsafe',
          wrap: 'unsafe',
        },
        description:
          'Menu item component with action handlers and parent dependencies. Swizzling is unsafe and may break menu functionality. Use CSS variables for styling customization.',
      },
      'CopyPageContent/Icons': {
        actions: {
          eject: 'forbidden',
          wrap: 'forbidden',
        },
        description:
          'The Icons folder is not directly swizzle-able, but you can swizzle its sub-components.',
      },
      'CopyPageContent/Icons/ChatGPTIcon': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'ChatGPT integration icon component. Safe to replace with custom icon.',
      },
      'CopyPageContent/Icons/ChevronIcon': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'Dropdown arrow icon component. Safe to replace with custom icon.',
      },
      'CopyPageContent/Icons/ClaudeIcon': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'Claude integration icon component. Safe to replace with custom icon.',
      },
      'CopyPageContent/Icons/MarkdownIcon': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'Markdown file icon component. Safe to replace with custom icon.',
      },
      'DocItem/Content': {
        actions: {
          eject: 'safe',
          wrap: 'safe',
        },
        description:
          'Documentation content wrapper that integrates the copy page button with Docusaurus content. Safe to customize for layout modifications and additional content integration.',
      },
    },
  };
}