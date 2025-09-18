/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import clsx from 'clsx';

import { MdCheck , MdFileCopy } from "react-icons/md";


import ChevronIcon from '@theme/CopyPageContent/Icons/ChevronIcon';

import type { ResolvedCopyPageContentOptions } from '../../../hooks';

import styles from './styles.module.css';

interface CopyButtonProps {
  copyStatus: 'idle' | 'success' | 'error';
  finalConfig: ResolvedCopyPageContentOptions;
  isOpen: boolean;
  onMainAction: () => void | Promise<void>;
  onDropdownToggle: () => void;
}

export default function CopyButton({
  copyStatus,
  finalConfig,
  isOpen,
  onMainAction,
  onDropdownToggle
}: CopyButtonProps): React.JSX.Element {
  return (
    <div className={clsx(styles.splitButton, copyStatus === 'success' && styles.success)}>
      <button
        type="button"
        className={styles.mainButton}
        onClick={onMainAction}
        aria-label={copyStatus === 'success' ? 'Copied!' : 'Copy page as Markdown'}
      >
        {copyStatus === 'success' ? <MdCheck className={styles.icon} /> : <MdFileCopy className={styles.icon} />}
        <span>{copyStatus === 'success' ? 'Copied!' : finalConfig.buttonLabel}</span>
      </button>
      <button
        type="button"
        className={styles.dropdownButton}
        onClick={onDropdownToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="More copy options"
      >
        <ChevronIcon isOpen={isOpen} />
      </button>
    </div>
  );
}