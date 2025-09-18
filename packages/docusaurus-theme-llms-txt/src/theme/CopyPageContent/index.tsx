/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


import React from 'react';

import clsx from 'clsx';

import { useLocation } from '@docusaurus/router';
import { usePluginData } from '@docusaurus/useGlobalData';

import CopyButton from '@theme/CopyPageContent/CopyButton';
import DropdownMenu from '@theme/CopyPageContent/DropdownMenu';

import {
  useCopyContentData,
  useCopyButtonConfig,
  useDropdownState,
  useCopyActions,
} from '../../hooks';

import type { CopyPageContentProps, PluginGlobalData } from '../../types';

import styles from './styles.module.css';

/**
 * Main Copy Page Button component
 */
export default function CopyPageContent({ className }: CopyPageContentProps): React.JSX.Element | null {
  // ALL HOOKS MUST BE CALLED FIRST - Rules of Hooks compliance
  // Get current pathname from Docusaurus router
  const location = useLocation();
  const pathname = location.pathname;

  // Get plugin configuration from global data
  const pluginData = usePluginData('docusaurus-plugin-llms-txt', undefined) as PluginGlobalData | undefined;
  const pluginConfig = pluginData?.copyContentConfig;
  const dataUrl = pluginData?.copyContentDataUrl;
  const siteConfig = pluginData?.siteConfig;

  // Custom hooks for modular functionality - ALWAYS call these hooks
  const { copyContentData, isLoading } = useCopyContentData(dataUrl);
  const { isOpen, toggleDropdown, dropdownRef, setIsOpen } = useDropdownState();

  // Resolve final configuration - call hook unconditionally with safe fallback
  const finalConfig = useCopyButtonConfig(pluginConfig === false ? undefined : pluginConfig);

  // Action handlers - call hook unconditionally with safe fallbacks
  const { copyStatus, handleAction } = useCopyActions(
    finalConfig,
    siteConfig || { baseUrl: '/', url: '', trailingSlash: false },
    setIsOpen
  );

  // CONDITIONAL RENDERING LOGIC - after all hooks are called
  // Don't render if disabled or still loading
  if (pluginConfig === false || isLoading) {
    return null;
  }

  // Check if current page has markdown available
  const hasMarkdown = copyContentData?.[pathname];

  // Don't render if no markdown available for current route
  if (!hasMarkdown || !siteConfig) {
    return null;
  }

  // Clean CSS-positioned rendering
  return (
    <div
      className={clsx(
        styles.copyButton,
        className
      )}
      ref={dropdownRef}
    >
      <CopyButton
        copyStatus={copyStatus}
        finalConfig={finalConfig}
        isOpen={isOpen}
        onMainAction={() => handleAction('copyRaw')}
        onDropdownToggle={toggleDropdown}
      />

      <DropdownMenu
        isOpen={isOpen}
        finalConfig={finalConfig}
        onAction={handleAction}
      />
    </div>
  );
}

