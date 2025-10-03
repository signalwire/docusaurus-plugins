/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { type ReactNode } from 'react';

import { useWindowSize } from '@docusaurus/theme-common';

import CopyPageContent from '@theme/CopyPageContent';
import DocBreadcrumbsOriginal from '@theme-init/DocBreadcrumbs';

import styles from './styles.module.css';

/**
 * Wrapper for DocBreadcrumbs that adds the CopyPageContent button
 *
 * This component wraps the default Docusaurus breadcrumbs to add our
 * copy page button. By using a WRAP pattern instead of ejecting DocItem/Layout,
 * we avoid conflicts with other plugins that may also swizzle the layout.
 *
 * Layout:
 * - Desktop: Breadcrumbs and copy button side-by-side in flex container
 * - Mobile: Breadcrumbs first, then copy button in separate block below
 */
export default function DocBreadcrumbs(
  props: Record<string, never>
): ReactNode {
  const windowSize = useWindowSize();
  const isMobile = windowSize === 'mobile';

  return (
    <>
      <div className={styles.breadcrumbsWrapper}>
        <DocBreadcrumbsOriginal {...props} />
        {!isMobile && <CopyPageContent isMobile={false} />}
      </div>
      {isMobile && (
        <div className={styles.mobileCopyButton}>
          <CopyPageContent isMobile />
        </div>
      )}
    </>
  );
}
