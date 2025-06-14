import path from 'path';

import type { LoadContext } from '@docusaurus/types';
import type { CommanderStatic } from 'commander';
import fs from 'fs-extra';

import { CacheManager } from '../cache/cache';
import { getConfig } from '../config';
import {
  LLMS_TXT_FILENAME,
  LLMS_FULL_TXT_FILENAME,
  ERROR_MESSAGES,
  EXIT_CODE_ERROR,
} from '../constants';
import { getErrorMessage } from '../errors';
import { setupDirectories } from '../filesystem/paths';
import { createPluginLogger } from '../logging';
import { orchestrateProcessing } from '../orchestrator';
import type { PluginOptions } from '../types';

/**
 * CLI-specific conversion function
 * @internal
 */
async function runCliConversion(
  siteDir: string,
  options: Partial<PluginOptions>,
  context: LoadContext
): Promise<void> {
  const config = getConfig(options);
  const log = createPluginLogger(config);

  try {
    // Use unified processing orchestrator with empty routes (CLI context)
    const generatedFilesDir = context.generatedFilesDir;
    const result = await orchestrateProcessing(
      [], // Empty routes indicates CLI context
      {
        siteDir,
        generatedFilesDir,
        config,
        siteConfig: context.siteConfig,
        outDir: context.outDir,
        logger: log,
        contentSelectors: config.content?.contentSelectors ?? [],
        relativePaths: config.content?.relativePaths !== false,
      }
    );

    log.success(
      `CLI conversion completed successfully - processed ${result.processedCount} documents`
    );
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    log.error(
      ERROR_MESSAGES.CLI_OPERATION_FAILED('CLI conversion', errorMessage)
    );
    process.exit(EXIT_CODE_ERROR);
  }
}

/**
 * Register the `llms-txt` command
 * @internal
 */
export function registerLlmsTxt(
  cli: CommanderStatic,
  _pluginName: string,
  baseOptions: Partial<PluginOptions>,
  context: LoadContext
): void {
  cli
    .command('llms-txt [siteDir]')
    .description(
      'Generate llms.txt and/or Markdown files using cached routes from build'
    )
    .action(async (siteDirArg: string | undefined) => {
      const siteDir = siteDirArg ? path.resolve(siteDirArg) : process.cwd();
      await runCliConversion(siteDir, baseOptions, context);
    });
}

/**
 * Register the `llms-txt-clean` command
 * @internal
 */
export function registerLlmsTxtClean(
  cli: CommanderStatic,
  _pluginName: string,
  baseOptions: Partial<PluginOptions>,
  context: LoadContext
): void {
  cli
    .command('llms-txt-clean [siteDir]')
    .description(
      'Remove all generated markdown files and llms.txt using cached file info'
    )
    .option('--clear-cache', 'Also clear the plugin cache directory')
    .action(
      async (
        siteDirArg: string | undefined,
        options: { clearCache?: boolean }
      ) => {
        const siteDir = siteDirArg ? path.resolve(siteDirArg) : process.cwd();
        const config = getConfig(baseOptions);
        const log = createPluginLogger(config);

        try {
          // Use FileOperations service for all cache and path operations
          const generatedFilesDir = context.generatedFilesDir;
          const cacheManager = new CacheManager(
            siteDir,
            generatedFilesDir,
            config,
            context.outDir,
            context.siteConfig
          );
          const cache = await cacheManager.loadCache();
          const directories = setupDirectories(siteDir, config, context.outDir);

          if (!(await fs.pathExists(directories.outDir))) {
            log.warn(
              `Build directory not found: ${directories.outDir}. Run 'npm run build' first.`
            );
            return;
          }

          let cleanedFiles = 0;
          let cacheUpdated = false;
          let cacheEntriesCleared = 0;
          const updatedRoutes = [...cache.routes];

          if (cache.routes?.length > 0) {
            for (let i = 0; i < updatedRoutes.length; i++) {
              const cachedRoute = updatedRoutes[i];
              if (cachedRoute?.markdownFile) {
                try {
                  // The cached markdownFile is already a relative path, use it directly
                  const fullMarkdownPath = path.join(
                    directories.mdOutDir,
                    cachedRoute.markdownFile
                  );

                  // Try to remove file if it exists
                  if (await fs.pathExists(fullMarkdownPath)) {
                    await fs.remove(fullMarkdownPath);
                    cleanedFiles++;
                    log.debug(`Removed: ${cachedRoute.markdownFile}`);
                  } else {
                    log.debug(`Not found: ${cachedRoute.markdownFile}`);
                  }

                  // Clear the markdownFile field in cache
                  const { markdownFile, ...restOfRoute } = cachedRoute;
                  void markdownFile; // Explicitly ignore the destructured value
                  updatedRoutes[i] = restOfRoute;
                  cacheUpdated = true;
                  cacheEntriesCleared++;
                } catch (error) {
                  const errorMessage = getErrorMessage(error);
                  log.warn(
                    ERROR_MESSAGES.FILE_REMOVAL_FAILED(
                      cachedRoute.markdownFile,
                      errorMessage
                    )
                  );

                  // Still clear the cache entry even if file removal failed
                  const { markdownFile, ...restOfRoute } = cachedRoute;
                  void markdownFile; // Explicitly ignore the destructured value
                  updatedRoutes[i] = restOfRoute;
                  cacheUpdated = true;
                  cacheEntriesCleared++;
                }
              }
            }
          }

          // Clean up llms.txt file
          const llmsTxtPath = path.join(directories.outDir, LLMS_TXT_FILENAME);
          if (await fs.pathExists(llmsTxtPath)) {
            await fs.remove(llmsTxtPath);
            log.debug(`Removed ${LLMS_TXT_FILENAME}`);
          }

          // Clean up llms-full.txt file if it exists
          const llmsFullTxtPath = path.join(
            directories.outDir,
            LLMS_FULL_TXT_FILENAME
          );
          if (await fs.pathExists(llmsFullTxtPath)) {
            await fs.remove(llmsFullTxtPath);
            log.debug(`Removed ${LLMS_FULL_TXT_FILENAME}`);
          }

          // Handle cache clearing if requested
          if (options.clearCache) {
            const cacheInfo = cacheManager.getCacheInfo();
            if (await fs.pathExists(cacheInfo.dir)) {
              await fs.remove(cacheInfo.dir);
              log.debug(`Cleared cache directory: ${cacheInfo.dir}`);
            } else {
              log.debug(
                `Cache directory not found: ${cacheInfo.dir} (already clean)`
              );
            }
          } else {
            // Update cache if we modified any routes and not clearing cache
            if (cacheUpdated) {
              const updatedCache = {
                ...cache,
                routes: updatedRoutes,
              };

              await cacheManager.saveCache(updatedCache);
              log.debug(
                `Updated cache to clear ${cacheEntriesCleared} route entries`
              );
            }
          }

          const cacheStatus = options.clearCache
            ? ', cache cleared'
            : `, ${cacheEntriesCleared} cache entries cleared`;
          const summary = `Cleanup completed (${cleanedFiles} files removed${cacheStatus})`;
          log.success(summary);
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          log.error(
            ERROR_MESSAGES.CLI_OPERATION_FAILED('Cleanup', errorMessage)
          );
          process.exit(EXIT_CODE_ERROR);
        }
      }
    );
}
