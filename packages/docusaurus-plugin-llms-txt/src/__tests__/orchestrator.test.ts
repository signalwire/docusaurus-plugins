/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { CacheManager } from '../cache/cache';
import {
  analyzeCacheStrategy,
  validateCliContext,
} from '../cache/cache-strategy';
import { collectAllAttachments } from '../config';
import { setupDirectories, buildSiteUrl } from '../filesystem/paths';
import { generateOutputFiles } from '../generation/output-generator';
import { orchestrateProcessing } from '../orchestrator';
import { AttachmentProcessor } from '../processing/attachment-processor';
import { coordinateProcessing } from '../processing/processing-coordinator';

jest.mock('../cache/cache', () => ({ CacheManager: jest.fn() }));
jest.mock('../cache/cache-strategy', () => ({
  analyzeCacheStrategy: jest.fn(),
  validateCliContext: jest.fn(),
}));
jest.mock('../config', () => ({ collectAllAttachments: jest.fn() }));
jest.mock('../filesystem/paths', () => ({
  setupDirectories: jest.fn(),
  buildSiteUrl: jest.fn(),
}));
jest.mock('../generation/output-generator', () => ({
  generateOutputFiles: jest.fn(),
}));
jest.mock('../processing/attachment-processor', () => ({
  AttachmentProcessor: jest.fn(),
}));
jest.mock('../processing/processing-coordinator', () => ({
  coordinateProcessing: jest.fn(),
}));

describe('orchestrateProcessing', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('processes configured attachments when a CLI caller does not supply them', async () => {
    const cache = { routes: [] };
    const configuredAttachments = [
      {
        source: './attachment.md',
        title: 'Attachment',
        sectionId: 'attachments',
      },
    ];
    const processedAttachments = [
      {
        title: 'Attachment',
        sectionId: 'attachments',
        url: '/assets/llms-txt/attachments/attachment.md',
        content: 'Attachment content',
        sourcePath: './attachment.md',
        includeInFullTxt: true,
      },
    ];
    const processAttachments = jest
      .fn()
      .mockResolvedValue(processedAttachments);
    const logger = {
      debug: jest.fn(),
      info: jest.fn(),
    };

    jest.mocked(CacheManager).mockImplementation(
      () =>
        ({
          loadCache: jest.fn().mockResolvedValue(cache),
        }) as never
    );
    jest.mocked(analyzeCacheStrategy).mockReturnValue({
      useCache: true,
      reason: 'Using cached data from previous build',
      cacheHasRoutes: true,
      configMatches: true,
    } as never);
    jest
      .mocked(setupDirectories)
      .mockReturnValue({ outDir: '/site/build' } as never);
    jest.mocked(buildSiteUrl).mockReturnValue('https://example.com');
    jest.mocked(coordinateProcessing).mockResolvedValue({
      docs: [],
      processedCount: 0,
      cacheUpdated: false,
    });
    jest
      .mocked(collectAllAttachments)
      .mockReturnValue(configuredAttachments as never);
    jest
      .mocked(AttachmentProcessor)
      .mockImplementation(() => ({ processAttachments }) as never);
    jest.mocked(generateOutputFiles).mockResolvedValue({
      llmsTxtPath: '/site/build/llms.txt',
      contentLength: 0,
    });

    await orchestrateProcessing([], {
      siteDir: '/site',
      generatedFilesDir: '/site/.docusaurus',
      config: {},
      siteConfig: {},
      outDir: '/site/build',
      logger,
      contentSelectors: [],
      relativePaths: true,
    } as never);

    expect(validateCliContext).toHaveBeenCalledWith(true, true, logger);
    expect(processAttachments).toHaveBeenCalledWith(
      configuredAttachments,
      '/site',
      '/site/build'
    );
    expect(jest.mocked(generateOutputFiles).mock.calls[0]?.[5]).toBe(
      processedAttachments
    );
  });
});
