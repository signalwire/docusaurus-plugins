/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import { FaMarkdown } from 'react-icons/fa';

import styles from '../styles.module.css';

export default function MarkdownIcon(): React.JSX.Element {
  return <FaMarkdown className={styles.icon} />;
}
