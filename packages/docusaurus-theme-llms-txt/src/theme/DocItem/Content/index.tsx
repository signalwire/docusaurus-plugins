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

export default function DocContent(props: Props): ReactNode {
  return (
    <>
      <CopyPageContent />
      <Content {...props} />
    </>
  );
}
