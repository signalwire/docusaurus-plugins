/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type React from 'react';

import { SiClaude } from '@signalwire/docusaurus-theme-llms-txt/react-icons';

import styles from '../styles.module.css';

export default function ClaudeIcon(): React.JSX.Element {
  return <SiClaude className={styles.icon} />;
}
