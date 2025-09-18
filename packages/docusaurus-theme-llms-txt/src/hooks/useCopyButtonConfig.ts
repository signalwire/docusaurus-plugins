/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { CopyPageContentOptions } from '../types/copyButton';

// Resolved configuration type
export interface ResolvedCopyPageContentOptions {
  buttonLabel: string;
  markdown: boolean;
  chatGPT: { enabled: boolean; prompt: string; };
  claude: { enabled: boolean; prompt: string; };
}

// Default configuration
const DEFAULT_CONFIG: ResolvedCopyPageContentOptions = {
  buttonLabel: 'Copy Page',
  markdown: true,
  chatGPT: {
    enabled: true,
    prompt: 'Analyze this documentation:'
  },
  claude: {
    enabled: true,
    prompt: 'Analyze this documentation:'
  },
};

/**
 * Hook to resolve configuration from plugin config
 */
export default function useCopyButtonConfig(
  pluginConfig: boolean | CopyPageContentOptions | undefined
): ResolvedCopyPageContentOptions {
  if (pluginConfig === false) {
    throw new Error('Component should not render when disabled');
  }

  let baseConfig = { ...DEFAULT_CONFIG };

  // Merge plugin configuration
  if (pluginConfig && typeof pluginConfig === 'object') {
    baseConfig = {
      buttonLabel: pluginConfig.buttonLabel ?? baseConfig.buttonLabel,
      markdown: pluginConfig.actions?.markdown ?? baseConfig.markdown,
      chatGPT: {
        enabled: (() => {
          if (typeof pluginConfig.actions?.ai?.chatGPT === 'boolean') {
            return pluginConfig.actions.ai.chatGPT;
          }
          if (pluginConfig.actions?.ai?.chatGPT && typeof pluginConfig.actions.ai.chatGPT === 'object') {
            return true;
          }
          return baseConfig.chatGPT.enabled;
        })(),
        prompt: pluginConfig.actions?.ai?.chatGPT && typeof pluginConfig.actions.ai.chatGPT === 'object'
          ? (pluginConfig.actions.ai.chatGPT.prompt ?? baseConfig.chatGPT.prompt)
          : baseConfig.chatGPT.prompt,
      },
      claude: {
        enabled: (() => {
          if (typeof pluginConfig.actions?.ai?.claude === 'boolean') {
            return pluginConfig.actions.ai.claude;
          }
          if (pluginConfig.actions?.ai?.claude && typeof pluginConfig.actions.ai.claude === 'object') {
            return true;
          }
          return baseConfig.claude.enabled;
        })(),
        prompt: pluginConfig.actions?.ai?.claude && typeof pluginConfig.actions.ai.claude === 'object'
          ? (pluginConfig.actions.ai.claude.prompt ?? baseConfig.claude.prompt)
          : baseConfig.claude.prompt,
      },
    };
  }

  return baseConfig;
}