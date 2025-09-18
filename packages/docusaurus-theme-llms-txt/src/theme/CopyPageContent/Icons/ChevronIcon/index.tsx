/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import clsx from 'clsx';

import { FiChevronDown } from 'react-icons/fi';

import buttonStyles from '../../CopyButton/styles.module.css';

interface ChevronIconProps {
  isOpen: boolean;
}

export default function ChevronIcon({
  isOpen,
}: ChevronIconProps): React.JSX.Element {
  return (
    <FiChevronDown
      className={clsx(
        buttonStyles.arrowIcon,
        isOpen && buttonStyles.arrowIconOpen
      )}
    />
  );
}
