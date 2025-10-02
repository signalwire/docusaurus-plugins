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

// Simple in-memory cache: URL → data
// Prevents re-fetching when component remounts
// (e.g., on window resize mobile ↔ desktop)
const dataCache = new Map<string, CopyContentData>();

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

    // Check cache first - instant return if available
    const cached = dataCache.get(dataUrl);
    if (cached) {
      setData(cached);
      setIsLoading(false);
      return undefined;
    }

    // Not in cache, fetch from network
    setIsLoading(true);

    fetch(dataUrl)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `Failed to fetch copy content data: ${response.status}`
          );
        }
        return (await response.json()) as CopyContentData;
      })
      .then((fetchedData) => {
        // Store in cache for future component mounts
        dataCache.set(dataUrl, fetchedData);
        setData(fetchedData);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load copy content data:', error);
        setData(null);
        setIsLoading(false);
      });

    return undefined;
  }, [dataUrl]);

  return {
    copyContentData: data,
    isLoading,
  };
}
