/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useCallback } from 'react';

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
export default function CopyPageContent({
  className,
  isMobile = false,
}: CopyPageContentProps): React.JSX.Element | null {
  // Get current pathname from Docusaurus router
  const location = useLocation();
  const pathname = location.pathname;

  // Get plugin configuration from global data
  const pluginData = usePluginData('docusaurus-plugin-llms-txt', undefined) as
    | PluginGlobalData
    | undefined;
  const pluginConfig = pluginData?.copyContentConfig;
  const dataUrl = pluginData?.copyContentDataUrl;
  const siteConfig = pluginData?.siteConfig;

  // Custom hooks for modular functionality
  const { copyContentData, isLoading } = useCopyContentData(dataUrl);
  const { isOpen, toggleDropdown, dropdownRef, setIsOpen } = useDropdownState();

  // Resolve final configuration
  const finalConfig = useCopyButtonConfig(pluginConfig);

  // Action handlers
  const { copyStatus, handleAction } = useCopyActions(
    finalConfig,
    siteConfig!,
    setIsOpen
  );

  // Memoize action handlers to prevent unnecessary re-renders
  const handleMainAction = useCallback(
    () => handleAction('copyRaw'),
    [handleAction]
  );
  const handleDropdownToggle = useCallback(
    () => toggleDropdown(),
    [toggleDropdown]
  );

  // Don't render if disabled, loading, or no markdown available
  if (
    pluginConfig === false ||
    isLoading ||
    !copyContentData?.[pathname] ||
    !siteConfig
  ) {
    return null;
  }

  // Render the button with dropdown menu
  return (
    <div
      className={clsx(
        styles.copyButton,
        isMobile && styles.copyButtonMobile,
        className
      )}
      ref={dropdownRef}
      data-copy-page-button
    >
      <CopyButton
        copyStatus={copyStatus}
        finalConfig={finalConfig}
        isOpen={isOpen}
        onMainAction={handleMainAction}
        onDropdownToggle={handleDropdownToggle}
      />

      <DropdownMenu
        isOpen={isOpen}
        finalConfig={finalConfig}
        onAction={handleAction}
        isMobile={isMobile}
      />
    </div>
  );
}
