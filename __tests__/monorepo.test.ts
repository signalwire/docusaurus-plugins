/**
 * Root-level tests for monorepo-wide functionality
 * These tests cover integration between packages, shared utilities, and overall system behavior
 * Similar to Docusaurus monorepo validation tests
 */

import * as fs from 'fs-extra';
import { Globby } from '@docusaurus/utils';
import { Joi } from '@docusaurus/utils-validation';

type PackageJsonFile = {
  file: string;
  content: {
    name?: string;
    private?: boolean;
    version?: string;
    main?: string;
    types?: string;
    repository?: {
      type?: string;
      url?: string;
      directory?: string;
    };
    publishConfig?: {
      access?: string;
    };
    peerDependencies?: Record<string, string>;
  };
};

type TsconfigFile = {
  file: string;
  content: {
    extends?: string;
    compilerOptions?: {
      [key: string]: unknown;
    };
  };
};

async function getPackageJsonFiles(): Promise<PackageJsonFile[]> {
  const files = await Globby('packages/*/package.json');
  return Promise.all(
    files.map((file) =>
      fs
        .readJSON(file)
        .then((content: PackageJsonFile['content']) => ({ file, content }))
    )
  );
}

async function getTsconfigFiles(): Promise<TsconfigFile[]> {
  const files = await Globby('packages/*/tsconfig.*');
  return Promise.all(
    files.map((file) =>
      fs
        .readJSON(file)
        .then((content: TsconfigFile['content']) => ({ file, content }))
    )
  );
}

const tsconfigSchema = Joi.object({
  extends: Joi.valid('../../tsconfig.base.json', '../../tsconfig.base.client.json', '@docusaurus/tsconfig'),
  compilerOptions: Joi.object({
    outDir: Joi.string().optional(),
    rootDir: Joi.string().optional(),
  }).unknown().optional(),
}).unknown();

const packageJsonSchema = Joi.object({
  name: Joi.string().required(),
  version: Joi.string().required(),
  main: Joi.string().required(),
  types: Joi.string().required(),
  repository: Joi.object({
    type: Joi.string().valid('git').required(),
    url: Joi.string().required(),
    directory: Joi.string().required(),
  }).required(),
  publishConfig: Joi.when('name', {
    is: Joi.string().pattern(/^@/),
    then: Joi.object({
      access: Joi.string().valid('public').required(),
      registry: Joi.string().optional(),
    }).required(),
    otherwise: Joi.optional(),
  }),
}).unknown();

describe('Monorepo Structure', () => {
  it('should have packages', async () => {
    const packageJsonFiles = await getPackageJsonFiles();
    expect(packageJsonFiles.length).toBeGreaterThan(0);
  });

  it('should have proper TypeScript project references', async () => {
    const rootTsconfig = await fs.readJSON('tsconfig.json');
    expect(rootTsconfig.references).toBeDefined();
    expect(Array.isArray(rootTsconfig.references)).toBe(true);
  });
});

describe('TypeScript Configuration Validation', () => {
  it('contain all required fields', async () => {
    const tsconfigFiles = await getTsconfigFiles();

    tsconfigFiles.forEach((file) => {
      try {
        Joi.attempt(file.content, tsconfigSchema);
      } catch (e) {
        (e as Error).message +=
          `\n${file.file} does not match the required schema.`;
        throw e;
      }
    });
  });
});

describe('Package Structure Validation', () => {
  it('should have consistent package.json structure', async () => {
    const packageJsonFiles = await getPackageJsonFiles();

    packageJsonFiles
      .filter((pkg) => !pkg.content.private)
      .forEach((pkg) => {
        try {
          Joi.attempt(pkg.content, packageJsonSchema);
        } catch (e) {
          (e as Error).message +=
            `\n${pkg.file} does not match the required schema.`;
          throw e;
        }
      });
  });

  it('should have proper peer dependencies for Docusaurus plugins', async () => {
    const packageJsonFiles = await getPackageJsonFiles();

    const pluginPackages = packageJsonFiles.filter(
      (pkg) =>
        pkg.content.name?.startsWith('docusaurus-plugin-') ||
        pkg.content.name?.includes('/docusaurus-plugin-')
    );

    if (pluginPackages.length > 0) {
      pluginPackages.forEach((pkg) => {
        expect(pkg.content.peerDependencies).toBeDefined();
        expect(
          pkg.content.peerDependencies?.['@docusaurus/core']
        ).toBeDefined();
      });
    } else {
      // Skip this test if no actual plugin packages exist yet
      expect(true).toBe(true);
    }
  });
});
