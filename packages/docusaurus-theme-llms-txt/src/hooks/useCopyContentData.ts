/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useState, useEffect, useRef, useMemo } from 'react';

// JSON data structure
interface CopyContentData {
  [routePath: string]: boolean;
}

interface CacheEntry {
  url: string;
  data: CopyContentData;
  promise?: Promise<CopyContentData>;
}

export default function useCopyContentData(dataUrl: string | undefined): {
  copyContentData: CopyContentData | null;
  isLoading: boolean;
} {
  // Component-managed cache using useRef for persistence across re-renders
  // This cache resets when component unmounts or dataUrl changes
  const cacheRef = useRef<CacheEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use useMemo to determine current data state without side effects
  const _currentData = useMemo(() => {
    if (!dataUrl || typeof window === 'undefined') {
      return { data: null, needsFetch: false, shouldLoad: false };
    }

    // Check if we have cached data for the exact same URL
    if (cacheRef.current?.url === dataUrl) {
      return {
        data: cacheRef.current.data,
        needsFetch: false,
        shouldLoad: false,
      };
    }

    // If we have a pending promise for the same URL, wait for it
    if (cacheRef.current?.promise && cacheRef.current.url === dataUrl) {
      return { data: null, needsFetch: false, shouldLoad: true };
    }

    // Clear old cache since URL has changed and need to fetch
    return { data: null, needsFetch: true, shouldLoad: true };
  }, [dataUrl]);

  useEffect(() => {
    // Update loading state based on current data state
    setIsLoading(_currentData.shouldLoad);

    // Early return if no fetch is needed or dataUrl is undefined
    if (!_currentData.needsFetch || !dataUrl) {
      return undefined;
    }

    // Clear old cache since URL has changed
    cacheRef.current = null;

    let isCancelled = false;

    // Create fetch function
    const fetchData = async (): Promise<CopyContentData> => {
      const response = await fetch(dataUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch copy content data: ${response.status}`
        );
      }
      return (await response.json()) as CopyContentData;
    };

    // Start the fetch and store promise in cache
    const promise = fetchData();
    cacheRef.current = {
      url: dataUrl,
      data: {} as CopyContentData, // Temporary, will be replaced
      promise,
    };

    // Handle the promise
    void promise
      .then((data) => {
        if (!isCancelled && cacheRef.current?.url === dataUrl) {
          // Update cache with successful result
          cacheRef.current = {
            url: dataUrl,
            data,
          };
          setIsLoading(false);
        }
        return undefined;
      })
      .catch((error) => {
        console.error('Failed to load copy content data:', error);
        if (!isCancelled) {
          // Clear cache on error
          cacheRef.current = null;
          setIsLoading(false);
        }
        return undefined;
      });

    return () => {
      isCancelled = true;
    };
  }, [dataUrl, _currentData]);

  return {
    copyContentData: _currentData.data || cacheRef.current?.data || null,
    isLoading,
  };
}
