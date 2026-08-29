/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useCallback } from 'react';
import type React from 'react';

import clsx from 'clsx';

import Translate from '@docusaurus/Translate';

import MenuItem from '@theme/CopyPageContent/DropdownMenu/MenuItem';
import ChatGPTIcon from '@theme/CopyPageContent/Icons/ChatGPTIcon';
import ClaudeIcon from '@theme/CopyPageContent/Icons/ClaudeIcon';
import HtmlIcon from '@theme/CopyPageContent/Icons/HtmlIcon';
import MarkdownIcon from '@theme/CopyPageContent/Icons/MarkdownIcon';

import type { ResolvedCopyPageContentOptions } from '@signalwire/docusaurus-theme-llms-txt/hooks';

import styles from './styles.module.css';

interface DropdownMenuProps {
  isOpen: boolean;
  finalConfig: ResolvedCopyPageContentOptions;
  onAction: (action: string) => void;
  isMobile?: boolean;
  hasMarkdown?: boolean;
}

export default function DropdownMenu({
  isOpen,
  finalConfig,
  onAction,
  isMobile = false,
  hasMarkdown = true,
}: DropdownMenuProps): React.JSX.Element {
  // Determine what content will actually be copied based on contentStrategy
  const willCopyMarkdown =
    finalConfig.contentStrategy === 'prefer-markdown' && hasMarkdown;

  // Memoize action handlers to prevent unnecessary re-renders of MenuItem
  const handleCopyRaw = useCallback(() => onAction('copyRaw'), [onAction]);
  const handleViewMarkdown = useCallback(
    () => onAction('viewMarkdown'),
    [onAction]
  );
  const handleChatGPT = useCallback(() => onAction('openChatGPT'), [onAction]);
  const handleClaude = useCallback(() => onAction('openClaude'), [onAction]);

  return (
    <div
      className={clsx(
        styles.dropdown,
        isOpen && styles.dropdownVisible,
        isMobile && styles.dropdownMobile
      )}
    >
      <MenuItem
        icon={willCopyMarkdown ? <MarkdownIcon /> : <HtmlIcon />}
        description={
          willCopyMarkdown
            ? 'Copy page as Markdown for LLMs'
            : 'Copy page as HTML for LLMs'
        }
        onClick={handleCopyRaw}
      >
        {willCopyMarkdown ? (
          <Translate id='copyPage.copyRawMarkdown'>Copy Raw Markdown</Translate>
        ) : (
          <Translate id='copyPage.copyRawHtml'>Copy Raw HTML</Translate>
        )}
      </MenuItem>

      {finalConfig.viewMarkdown && hasMarkdown && (
        <MenuItem
          icon={<MarkdownIcon />}
          description='View markdown file in new tab'
          onClick={handleViewMarkdown}
        >
          <Translate id='copyPage.viewMarkdown'>View Markdown</Translate>
        </MenuItem>
      )}

      {finalConfig.chatGPT.enabled && (
        <MenuItem
          icon={<ChatGPTIcon />}
          description='Ask questions about this page'
          onClick={handleChatGPT}
        >
          <Translate id='copyPage.referenceInChatGPT'>
            Reference in ChatGPT
          </Translate>
        </MenuItem>
      )}

      {finalConfig.claude.enabled && (
        <MenuItem
          icon={<ClaudeIcon />}
          description='Ask questions about this page'
          onClick={handleClaude}
        >
          <Translate id='copyPage.referenceInClaude'>
            Reference in Claude
          </Translate>
        </MenuItem>
      )}
    </div>
  );
}
