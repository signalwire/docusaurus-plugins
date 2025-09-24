/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useCallback } from 'react';

import clsx from 'clsx';

import Translate from '@docusaurus/Translate';

import MenuItem from '@theme/CopyPageContent/DropdownMenu/MenuItem';
import ChatGPTIcon from '@theme/CopyPageContent/Icons/ChatGPTIcon';
import ClaudeIcon from '@theme/CopyPageContent/Icons/ClaudeIcon';
import MarkdownIcon from '@theme/CopyPageContent/Icons/MarkdownIcon';

import type { ResolvedCopyPageContentOptions } from '../../../hooks';

import styles from './styles.module.css';

interface DropdownMenuProps {
  isOpen: boolean;
  finalConfig: ResolvedCopyPageContentOptions;
  onAction: (action: string) => void;
}

export default function DropdownMenu({
  isOpen,
  finalConfig,
  onAction,
}: DropdownMenuProps): React.JSX.Element {
  // Memoize action handlers to prevent unnecessary re-renders of MenuItem
  const handleCopyRaw = useCallback(() => onAction('copyRaw'), [onAction]);
  const handleChatGPT = useCallback(() => onAction('openChatGPT'), [onAction]);
  const handleClaude = useCallback(() => onAction('openClaude'), [onAction]);

  return (
    <div className={clsx(styles.dropdown, isOpen && styles.dropdownVisible)}>
      {finalConfig.markdown && (
        <MenuItem
          icon={<MarkdownIcon />}
          description='Copy page as Markdown for LLMs'
          onClick={handleCopyRaw}
        >
          <Translate id='copyPage.copyRawMarkdown'>Copy Raw Markdown</Translate>
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
