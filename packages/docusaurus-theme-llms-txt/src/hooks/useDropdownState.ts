/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useState, useRef, useEffect, useCallback } from 'react';

import { useLocation } from '@docusaurus/router';

// The return type is inferred on purpose. React 18 and 19 disagree on what
// useRef<T>(null) produces -- 19 widens it to RefObject<T | null> -- so naming
// either shape makes the other major reject `ref={dropdownRef}`.
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function useDropdownState() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const pathname = location.pathname;

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }

    return undefined;
  }, [isOpen]);

  const toggleDropdown = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);

  // Keep the public setter boolean-only instead of exposing React's wider
  // Dispatch<SetStateAction<boolean>> implementation detail.
  const setOpen = useCallback((nextIsOpen: boolean) => {
    setIsOpen(nextIsOpen);
  }, []);

  return {
    isOpen,
    setIsOpen: setOpen,
    toggleDropdown,
    dropdownRef,
  };
}
