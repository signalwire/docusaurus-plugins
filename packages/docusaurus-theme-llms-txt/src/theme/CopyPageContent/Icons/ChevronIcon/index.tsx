/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type React from 'react';

import clsx from 'clsx';

import { FiChevronDown } from '@signalwire/docusaurus-theme-llms-txt/react-icons';

import styles from './styles.module.css';

interface ChevronIconProps {
  isOpen: boolean;
}

export default function ChevronIcon({
  isOpen,
}: ChevronIconProps): React.JSX.Element {
  return (
    <FiChevronDown
      className={clsx(styles.arrowIcon, isOpen && styles.arrowIconOpen)}
    />
  );
}
