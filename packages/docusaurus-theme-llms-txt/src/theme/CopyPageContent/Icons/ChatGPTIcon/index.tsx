/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type React from 'react';

// Simple Icons dropped the OpenAI logo in react-icons 5.7.0, so `SiOpenai` no
// longer exists. RiOpenaiFill is the closest filled monochrome equivalent and
// matches the weight of SiClaude in the same menu.
import { RiOpenaiFill } from '@signalwire/docusaurus-theme-llms-txt/react-icons';

import styles from './styles.module.css';

export default function ChatGPTIcon(): React.JSX.Element {
  return <RiOpenaiFill className={styles.icon} />;
}
