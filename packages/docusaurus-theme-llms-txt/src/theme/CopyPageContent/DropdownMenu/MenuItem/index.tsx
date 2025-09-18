/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import styles from './styles.module.css';

interface MenuItemProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  description?: string;
  onClick: () => void;
}

export default function MenuItem({ icon, children, description, onClick }: MenuItemProps): React.JSX.Element {
  return (
    <button
      type="button"
      className={styles.menuItem}
      onClick={onClick}
    >
      <div className={styles.iconContainer}>
        {icon}
      </div>
      <div className={styles.menuItemContent}>
        <span className={styles.menuItemLabel}>{children}</span>
        {description && (
          <span className={styles.menuItemDescription}>{description}</span>
        )}
      </div>
    </button>
  );
}