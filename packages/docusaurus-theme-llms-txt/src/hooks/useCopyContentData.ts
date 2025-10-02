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

interface CacheEntry {
  url: string;
  data: CopyContentData | null;
  promise?: Promise<CopyContentData>;
}

// Global module-level cache shared across all component instances
// This prevents multiple instances from fetching the same data simultaneously
const globalCache = new Map<string, CacheEntry>();

export default function useCopyContentData(dataUrl: string | undefined): {
  copyContentData: CopyContentData | null;
  isLoading: boolean;
} {
  const [data, setData] = useState<CopyContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!dataUrl) {
      setIsLoading(false);
      setData(null);
      return undefined;
    }

    const cached = globalCache.get(dataUrl);

    // If we already have data in cache, use it immediately
    if (cached?.data) {
      setData(cached.data);
      setIsLoading(false);
      return undefined;
    }

    // If there's a pending fetch, wait for it
    if (cached?.promise) {
      setIsLoading(true);
      void cached.promise.then((fetchedData) => {
        setData(fetchedData);
        setIsLoading(false);
        return undefined;
      });
      return undefined;
    }

    // Need to start a new fetch
    setIsLoading(true);

    const fetchData = async (): Promise<CopyContentData> => {
      const response = await fetch(dataUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch copy content data: ${response.status}`
        );
      }
      return (await response.json()) as CopyContentData;
    };

    const promise = fetchData();
    globalCache.set(dataUrl, {
      url: dataUrl,
      data: null,
      promise,
    });

    void promise
      .then((fetchedData) => {
        // Update global cache
        globalCache.set(dataUrl, {
          url: dataUrl,
          data: fetchedData,
        });
        // Update local state
        setData(fetchedData);
        setIsLoading(false);
        return undefined;
      })
      .catch((error) => {
        console.error('Failed to load copy content data:', error);
        globalCache.delete(dataUrl);
        setData(null);
        setIsLoading(false);
        return undefined;
      });

    return undefined;
  }, [dataUrl]);

  return {
    copyContentData: data,
    isLoading,
  };
}
