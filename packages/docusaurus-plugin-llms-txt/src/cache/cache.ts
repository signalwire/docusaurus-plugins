/**
 * Simplified cache management service
 * Uses focused modules for validation and I/O operations
 * @internal
 */

import path from 'path';

import type { RouteConfig } from '@docusaurus/types';

import packageJson from '../../package.json';
import { CACHE_FILENAME } from '../constants';
import { routePathToHtmlPath } from '../discovery/route-filter';
import { PathManager, htmlPathToMdPath } from '../filesystem/paths';
import type {
  DocInfo,
  PluginOptions,
  CachedRouteInfo,
  CacheSchema,
} from '../types';

import { CacheIO } from './cache-io';
import { isCachedRouteValid, calcConfigHash } from './cache-validation';

/**
 * Simplified cache management service
 * @internal
 */
export class CacheManager {
  private pathManager: PathManager;
  private cacheIO: CacheIO;
  private siteConfig?: { baseUrl: string; trailingSlash?: boolean };

  constructor(
    siteDir: string,
    generatedFilesDir: string,
    config: PluginOptions,
    outDir?: string,
    siteConfig?: { baseUrl: string; trailingSlash?: boolean }
  ) {
    this.pathManager = new PathManager(siteDir, config, outDir);
    this.siteConfig = siteConfig;
    const cacheDir = path.join(generatedFilesDir, 'docusaurus-plugin-llms-txt');
    const cachePath = path.join(cacheDir, CACHE_FILENAME);
    this.cacheIO = new CacheIO(cachePath);
  }

  /** Load cache from disk */
  async loadCache(): Promise<CacheSchema> {
    return this.cacheIO.loadCache();
  }

  /** Save cache to disk */
  async saveCache(cache: CacheSchema): Promise<void> {
    return this.cacheIO.saveCache(cache);
  }

  /** Check if cached route is still valid using focused validation */
  async isCachedRouteValid(
    cachedRoute: CachedRouteInfo,
    currentConfig: PluginOptions
  ): Promise<boolean> {
    return isCachedRouteValid(
      cachedRoute,
      currentConfig,
      this.pathManager.directories
    );
  }

  /** Check if cached routes are available */
  hasCachedRoutes(cache: CacheSchema): boolean {
    return cache.routes?.length > 0;
  }

  /** Check if the cached configuration matches the current configuration */
  isCacheConfigValid(
    cache: CacheSchema,
    currentConfig: PluginOptions
  ): boolean {
    const currentConfigHash = calcConfigHash(currentConfig);
    return cache.configHash === currentConfigHash;
  }

  /** Calculate configuration hash */
  calcConfigHash(options: Partial<PluginOptions>): string {
    return calcConfigHash(options);
  }

  /** Create cached route info from routes */
  createCachedRouteInfo(routes: RouteConfig[]): CachedRouteInfo[] {
    const cachedRoutes = routes.map((route) => {
      // Type guard for PluginRouteConfig with proper typing
      const pluginRoute = route as { plugin?: { name?: string } };

      const baseInfo = {
        path: route.path,
        htmlPath: routePathToHtmlPath(
          route.path,
          this.siteConfig?.baseUrl ?? '/',
          this.siteConfig?.trailingSlash
        ),
      };

      const pluginInfo = pluginRoute.plugin?.name
        ? { plugin: pluginRoute.plugin.name }
        : {};

      return { ...baseInfo, ...pluginInfo } satisfies CachedRouteInfo;
    });

    return cachedRoutes;
  }

  /** Update cached route info with processing results */
  updateCachedRouteWithDoc(
    cachedRoute: CachedRouteInfo,
    doc: DocInfo,
    hash: string,
    enableMarkdownFiles: boolean
  ): CachedRouteInfo {
    const baseUpdate = {
      ...cachedRoute,
      hash,
      title: doc.title,
      description: doc.description,
    };

    if (enableMarkdownFiles && doc.markdownFile) {
      return { ...baseUpdate, markdownFile: doc.markdownFile };
    } else if (enableMarkdownFiles && cachedRoute.htmlPath) {
      const mdPath = htmlPathToMdPath(
        cachedRoute.htmlPath,
        this.pathManager.directories.mdOutDir
      );
      const relativeMdPath = this.pathManager.getRelativeMarkdownPath(mdPath);
      return { ...baseUpdate, markdownFile: relativeMdPath };
    }

    return baseUpdate;
  }

  /** Convert cached route info to DocInfo for processing */
  cachedRouteToDocInfo(cachedRoute: CachedRouteInfo): DocInfo | null {
    if (!cachedRoute.htmlPath || !cachedRoute.title) {
      return null;
    }

    const baseDocInfo = {
      routePath: cachedRoute.path,
      htmlPath: cachedRoute.htmlPath,
      title: cachedRoute.title,
      description: cachedRoute.description ?? '',
    };

    const markdownInfo = cachedRoute.markdownFile
      ? { markdownFile: cachedRoute.markdownFile }
      : {};

    return { ...baseDocInfo, ...markdownInfo } satisfies DocInfo;
  }

  /** Update cache with processed routes and save to disk */
  async updateCacheWithRoutes(
    config: PluginOptions,
    cachedRoutes: CachedRouteInfo[]
  ): Promise<void> {
    const updatedCache = {
      pluginVersion: packageJson.version,
      configHash: calcConfigHash(config),
      routes: cachedRoutes,
    };

    await this.saveCache(updatedCache);
  }

  /** Get cache file information for debugging */
  getCacheInfo(): { dir: string; path: string } {
    return this.cacheIO.getCacheInfo();
  }
}

export default CacheManager;
