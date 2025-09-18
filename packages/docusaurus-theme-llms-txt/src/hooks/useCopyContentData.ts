/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useState, useEffect } from 'react';

// JSON data structure
interface CopyContentData {
  [routePath: string]: boolean;
}

// Module-level cache to persist data across component instances and page
// navigations
// This eliminates redundant network requests during SPA navigation
let cachedCopyContentData: CopyContentData | null = null;
let cachePromise: Promise<CopyContentData> | null = null;
let cachedDataUrl: string | null = null;

export default function useCopyContentData(dataUrl: string | undefined): {
  copyContentData: CopyContentData | null;
  isLoading: boolean;
} {
  const [copyContentData, setCopyContentData] = useState<CopyContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!dataUrl || typeof window === 'undefined') {
      setIsLoading(false);
      return undefined;
    }

    let isCancelled = false;

    // If we have cached data for the same URL, use it immediately
    if (cachedCopyContentData && cachedDataUrl === dataUrl) {
      setCopyContentData(cachedCopyContentData);
      setIsLoading(false);
      return undefined;
    }

    // If a fetch is already in progress for the same URL, wait for it
    if (cachePromise && cachedDataUrl === dataUrl) {
      void cachePromise.then((data) => {
        if (!isCancelled) {
          setCopyContentData(data);
          setIsLoading(false);
        }
      }).catch(() => {
        if (!isCancelled) {
          setCopyContentData(null);
          setIsLoading(false);
        }
      });
      return undefined;
    }

    // New URL or first fetch - initiate the request
    const fetchData = async (): Promise<CopyContentData> => {
      const response = await fetch(dataUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch copy content data: ${response.status}`);
      }
      return await response.json() as CopyContentData;
    };

    // Store the URL and promise for cache validation
    cachedDataUrl = dataUrl;
    cachePromise = fetchData();

    // Handle the promise
    void cachePromise.then((data) => {
      // Cache the successful result
      cachedCopyContentData = data;
      if (!isCancelled) {
        setCopyContentData(data);
        setIsLoading(false);
      }
      return undefined;
    }).catch((error) => {
      console.error('Failed to load copy content data:', error);
      // Clear cache on error
      cachePromise = null;
      cachedCopyContentData = null;
      if (!isCancelled) {
        setCopyContentData(null);
        setIsLoading(false);
      }
      return undefined;
    });

    return () => {
      isCancelled = true;
    };
  }, [dataUrl]);

  return { copyContentData, isLoading };
}