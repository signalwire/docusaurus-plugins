import baseLogger from '@docusaurus/logger';
import type { ReportingSeverity } from '@docusaurus/types';

import type { Logger } from '../types';

/**
 * Logger implementation with separated concerns:
 * - onRouteError: Controls how route processing failures are handled
 * - logLevel: Controls operational logging verbosity (0=quiet, 1=normal, 2=verbose, 3=debug)
 */
class PluginLogger implements Logger {
  private name: string;
  private onRouteError: ReportingSeverity;
  private logLevel: number;

  constructor(
    name: string,
    onRouteError: ReportingSeverity = 'warn',
    logLevel: number = 1
  ) {
    this.name = name;
    this.onRouteError = onRouteError;
    this.logLevel = logLevel;
  }

  /**
   * Gets the prefix for log messages
   */
  private getPrefix(): string {
    return `[${this.name}]`;
  }

  /**
   * Core reporting method (public API)
   */
  public report(severity: ReportingSeverity, msg: string): void {
    const reportingMethod = baseLogger.report(severity);
    reportingMethod(`${this.getPrefix()} ${msg}`);
  }

  /**
   * Report a route processing error with configurable severity
   */
  public reportRouteError(msg: string): void {
    if (this.onRouteError === 'ignore') {
      return;
    }
    this.report(this.onRouteError, `Route Error: ${msg}`);
  }

  /**
   * Log an error (always shown)
   */
  public error(msg: string): void {
    baseLogger.error(`${this.getPrefix()} ERROR: ${msg}`);
  }

  /**
   * Log a warning (level 1+)
   */
  public warn(msg: string): void {
    if (this.logLevel >= 1) {
      baseLogger.warn(`${this.getPrefix()} WARNING: ${msg}`);
    }
  }

  /**
   * Log general info (level 2+)
   */
  public info(msg: string): void {
    if (this.logLevel >= 2) {
      baseLogger.info(`${this.getPrefix()} ${msg}`);
    }
  }

  /**
   * Log debug info (level 3+)
   */
  public debug(msg: string): void {
    if (this.logLevel >= 3) {
      baseLogger.info(baseLogger.yellow(`${this.getPrefix()} DEBUG: ${msg}`));
    }
  }

  /**
   * Log success message (level 1+)
   */
  public success(msg: string): void {
    if (this.logLevel >= 1) {
      baseLogger.success(`${this.getPrefix()} ${msg}`);
    }
  }
}

/**
 * Factory function to create logger instances
 *
 * @param name - Name for log prefix
 * @param onRouteError - How to handle route processing failures
 * @param logLevel - Operational logging level (0=quiet, 1=normal, 2=verbose, 3=debug)
 * @returns A new logger instance
 */
export function createLogger(
  name: string,
  onRouteError: ReportingSeverity = 'warn',
  logLevel: number = 1
): Logger {
  return new PluginLogger(name, onRouteError, logLevel);
}

/**
 * Create logger for plugin operations with standard naming
 *
 * @param pluginConfig - Plugin configuration (optional)
 * @returns Logger instance with standard plugin name
 *
 * @example
 * ```typescript
 * // Quiet mode - only errors and successes
 * const logger = createPluginLogger({
 *   logLevel: 0
 * });
 *
 * // Normal mode (default) - errors, warnings, successes
 * const logger = createPluginLogger({
 *   logLevel: 1  // default
 * });
 *
 * // Verbose mode - errors, warnings, successes, info
 * const logger = createPluginLogger({
 *   logLevel: 2
 * });
 *
 * // Debug mode - everything including debug messages
 * const logger = createPluginLogger({
 *   logLevel: 3
 * });
 *
 * // Route error handling
 * const logger = createPluginLogger({
 *   onRouteError: 'throw'  // Fail fast on route errors
 * });
 * ```
 */
export function createPluginLogger(pluginConfig?: {
  onRouteError?: ReportingSeverity;
  logLevel?: number;
}): Logger {
  const onRouteError = pluginConfig?.onRouteError ?? 'warn';
  const logLevel = pluginConfig?.logLevel ?? 1;
  return createLogger('docusaurus-plugin-llms-txt', onRouteError, logLevel);
}
