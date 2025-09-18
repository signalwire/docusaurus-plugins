/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import { SiOpenai } from 'react-icons/si';

import styles from '../styles.module.css';

export default function ChatGPTIcon(): React.JSX.Element {
  return <SiOpenai className={styles.icon} />;
}