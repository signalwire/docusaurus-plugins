/**
 * Root-level tests for monorepo-wide functionality.
 * These cover integration between packages, shared utilities, and overall
 * system behavior, mirroring Docusaurus's own monorepo validation tests.
 */

import { Globby } from '@docusaurus/utils';
import { Joi } from '@docusaurus/utils-validation';
import * as fs from 'fs-extra';

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
    dependencies?: Record<string, string>;
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
  extends: Joi.valid(
    '../../tsconfig.base.json',
    '../../tsconfig.base.client.json',
    '@docusaurus/tsconfig'
  ),
  compilerOptions: Joi.object({
    outDir: Joi.string().optional(),
    rootDir: Joi.string().optional(),
  })
    .unknown()
    .optional(),
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
  it('has packages', async () => {
    const packageJsonFiles = await getPackageJsonFiles();
    expect(packageJsonFiles.length).toBeGreaterThan(0);
  });

  it('has TypeScript project references', async () => {
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
  it('has a consistent package.json structure', async () => {
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

  it('declares @docusaurus/core as a peer dependency, never a runtime one', async () => {
    const packageJsonFiles = await getPackageJsonFiles();

    const publishable = packageJsonFiles.filter(
      (pkg) => !pkg.content.private && pkg.content.name?.includes('docusaurus-')
    );
    expect(publishable.length).toBeGreaterThan(0);

    publishable.forEach((pkg) => {
      // Docusaurus is a build tool. Shipping it as a `dependency` would make
      // consumers install a second copy of @docusaurus/core and would drag
      // webpack-dev-server, image-size and friends into their production
      // audit scope. See facebook/docusaurus#5501.
      expect(pkg.content.dependencies?.['@docusaurus/core']).toBeUndefined();
      expect(pkg.content.peerDependencies?.['@docusaurus/core']).toBeDefined();
    });
  });

  it('accepts both React 18 and React 19 wherever React is a peer', async () => {
    const packageJsonFiles = await getPackageJsonFiles();

    const reactPeers = packageJsonFiles.filter(
      (pkg) => !pkg.content.private && pkg.content.peerDependencies?.react
    );
    expect(reactPeers.length).toBeGreaterThan(0);

    reactPeers.forEach((pkg) => {
      // Matches what @docusaurus/theme-classic itself declares. Docusaurus v4
      // will require React 19, but v3 sites are still on 18.
      expect(pkg.content.peerDependencies?.react).toBe('^18.0.0 || ^19.0.0');
      expect(pkg.content.peerDependencies?.['react-dom']).toBe(
        '^18.0.0 || ^19.0.0'
      );
    });
  });
});
