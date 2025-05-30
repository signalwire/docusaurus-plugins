import type { LoadContext, Plugin } from '@docusaurus/types';
import { flattenRoutes } from '@docusaurus/utils';

import { registerLlmsTxt, registerLlmsTxtClean } from './cli/command';
import { getConfig, validateUserInputs } from './config';
import { ERROR_MESSAGES, PLUGIN_NAME } from './constants';
import { getErrorMessage, createConfigError, isPluginError } from './errors';
import { createPluginLogger } from './logging';
import { orchestrateProcessing } from './orchestrator';
import type { PluginOptions } from './types';
import { pluginOptionsSchema } from './types';

/**
 * Docusaurus plugin to generate Markdown versions of HTML pages and an llms.txt index file.
 * 
 * This plugin runs after the build process and:
 * 1. Processes routes from Docusaurus to find relevant content
 * 2. Converts HTML pages to Markdown using rehype/remark
 * 3. Creates an llms.txt index file with links to all documents
 */
export default function llmsTxtPlugin(
  context: LoadContext,
  options: Partial<PluginOptions> = {}
): Plugin<void> {
  const name = PLUGIN_NAME;
  
  // Validate user inputs for security
  try {
    validateUserInputs(options);
  } catch (error) {
    if (isPluginError(error)) {
      throw error;
    }
    throw createConfigError(
      'Failed to validate plugin options',
      { options, error: getErrorMessage(error) }
    );
  }
  
  return {
    name,
    
    async postBuild({ outDir, siteDir, generatedFilesDir, siteConfig, routes }): Promise<void> {
      const config = getConfig(options);
      const log = createPluginLogger(config);

      log.debug(`outDir: ${outDir}`);
      log.debug(`siteDir: ${siteDir}`);
      log.debug(`generatedFilesDir: ${generatedFilesDir}`);

      if (config.runOnPostBuild === false) {
        log.info('Skipping postBuild processing (runOnPostBuild=false)');
        return;
      }
      
      try {
        const finalRoutes = flattenRoutes(routes);
        
        log.info(`Processing ${finalRoutes.length} routes`);
        
        // Use unified processing orchestrator with Docusaurus-provided paths
        const result = await orchestrateProcessing(finalRoutes, {
          siteDir,
          generatedFilesDir,
          config,
          siteConfig,
          outDir,
          logger: log,
          contentSelectors: config.content?.contentSelectors ?? [],
          relativePaths: config.content?.relativePaths !== false,
        });
        
        log.success(`Plugin completed successfully - processed ${result.processedCount} documents`);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        
        // Enhanced error reporting with better context
        if (isPluginError(error)) {
          log.error(`${ERROR_MESSAGES.PLUGIN_BUILD_FAILED(errorMessage)} [${error.code}]`);
          if (error.context) {
            log.debug(`Error context: ${JSON.stringify(error.context, null, 2)}`);
          }
        } else {
          log.error(ERROR_MESSAGES.PLUGIN_BUILD_FAILED(errorMessage));
        }
        
        throw error;
      }
    },

    extendCli(cli): void {
      registerLlmsTxt(cli, name, options, context);
      registerLlmsTxtClean(cli, name, options, context);
    },
  };
}

/**
 * Type-safe validation function with enhanced error handling
 * @internal
 * This function is called by Docusaurus framework - users should not call directly
 */
export function validateOptions({ 
  options: _options, 
  validate: _validate 
}: {
  options: unknown;
  validate: (_schema: unknown, _options: unknown) => PluginOptions;
}): PluginOptions {
  try {
    // Validate user inputs first
    validateUserInputs(_options);
    
    // Then use Joi validation
    return _validate(pluginOptionsSchema, _options);
  } catch (error) {
    if (isPluginError(error)) {
      throw error;
    }
    
    throw createConfigError(
      `Plugin option validation failed: ${getErrorMessage(error)}`,
      { options: _options }
    );
  }
}
