/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { type ReactNode } from 'react';

import CopyPageContent from '@theme/CopyPageContent';
import type ContentType from '@theme/DocItem/Content';
import Content from '@theme-init/DocItem/Content';

import type { WrapperProps } from '@docusaurus/types';

type Props = WrapperProps<typeof ContentType>;

/**
 * Wrapper version with clear fix to test if wrapping can achieve
 * the same result as ejecting for button positioning.
 */
export default function DocItemContentWrapper(props: Props): ReactNode {
  return (
    <>
      <CopyPageContent />
      <div style={{ clear: 'both' }} />
      <Content {...props} />
    </>
  );
}