/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useState } from 'react';

import { useLocation } from '@docusaurus/router';

import { constructMarkdownUrl, constructFullUrl, type SiteConfig } from '../utils/copyButton';

import type { ResolvedCopyPageContentOptions } from './useCopyButtonConfig';

export default function useCopyActions(
  finalConfig: ResolvedCopyPageContentOptions,
  siteConfig: SiteConfig | undefined,
  setIsOpen: (isOpen: boolean) => void
): {
  copyStatus: 'idle' | 'success' | 'error';
  handleAction: (action: string) => Promise<void>;
} {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const location = useLocation();
  const pathname = location.pathname;

  const handleAction = async (action: string) => {
    setIsOpen(false);

    if (action === 'copyRaw') {
      // Copy raw markdown content
      try {
        const markdownUrl = constructMarkdownUrl(pathname);
        const response = await fetch(markdownUrl);
        if (!response.ok) {throw new Error('Failed to fetch markdown');}
        const content = await response.text();
        await navigator.clipboard.writeText(content);

        setCopyStatus('success');
        setTimeout(() => setCopyStatus('idle'), 2000);
      } catch (error) {
        console.error('Copy action failed:', error);
        setCopyStatus('error');
        setTimeout(() => setCopyStatus('idle'), 3000);
      }
    } else if (action === 'openChatGPT' && siteConfig) {
      // Open ChatGPT with content
      const fullUrl = constructFullUrl(pathname, siteConfig);
      const encodedPrompt = encodeURIComponent(`${finalConfig.chatGPT.prompt} ${fullUrl}`);
      const chatUrl = `https://chatgpt.com/?q=${encodedPrompt}`;
      window.open(chatUrl, '_blank');
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } else if (action === 'openClaude' && siteConfig) {
      // Open Claude with content
      const fullUrl = constructFullUrl(pathname, siteConfig);
      const encodedPrompt = encodeURIComponent(`${finalConfig.claude.prompt} ${fullUrl}`);
      const claudeUrl = `https://claude.ai/new?q=${encodedPrompt}`;
      window.open(claudeUrl, '_blank');
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  return {
    copyStatus,
    handleAction,
  };
}