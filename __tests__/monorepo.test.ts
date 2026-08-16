/**
 * Root-level tests for monorepo-wide functionality.
 * These cover integration between packages, shared utilities, and overall
 * system behavior, mirroring Docusaurus's own monorepo validation tests.
 */

import { execFileSync } from 'child_process';
import path from 'path';

import { Globby } from '@docusaurus/utils';
import { Joi } from '@docusaurus/utils-validation';
import * as fs from 'fs-extra';
import ts from 'typescript';

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
    files?: string[];
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
  // tsconfig is JSONC, not JSON -- comments are legal and used in this repo, so
  // `fs.readJSON` would throw on them. TypeScript's own parser is the correct
  // reader, and it is already a devDependency.
  return files.map((file) => {
    const { config, error } = ts.readConfigFile(file, ts.sys.readFile);
    if (error) {
      throw new Error(
        `${file}: ${ts.flattenDiagnosticMessageText(error.messageText, '\n')}`
      );
    }
    return { file, content: config as TsconfigFile['content'] };
  });
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

  // Yarn Classic does not implement npm's "!" negation syntax, and when it
  // meets one it stops treating files[] as a whitelist entirely -- packing MORE
  // than intended, not less. Measured on this repo: 90 entries under npm pack
  // vs 141 under yarn pack for the same manifest. Keep the list positive and
  // rely on layout (tests live outside lib/ and src/theme) instead.
  it('uses no negation patterns in files[], which Yarn Classic mishandles', async () => {
    const packageJsonFiles = await getPackageJsonFiles();
    const publishable = packageJsonFiles.filter((pkg) => !pkg.content.private);
    expect(publishable.length).toBeGreaterThan(0);

    publishable.forEach((pkg) => {
      const negations = (pkg.content.files ?? []).filter((f) =>
        f.startsWith('!')
      );
      expect({ package: pkg.content.name, negations }).toEqual({
        package: pkg.content.name,
        negations: [],
      });
    });
  });

  // `npm pack --dry-run` is the only honest answer to "what do consumers
  // actually receive" -- the `files` array alone is easy to misread. The theme
  // publishes src/theme as the TypeScript swizzle template, so anything dropped
  // in that tree ends up in a user's swizzle output.
  it('publishes no test files or build metadata', async () => {
    const packageJsonFiles = await getPackageJsonFiles();
    const publishable = packageJsonFiles.filter((pkg) => !pkg.content.private);
    expect(publishable.length).toBeGreaterThan(0);

    publishable.forEach((pkg) => {
      const cwd = path.dirname(pkg.file);
      const raw = execFileSync(
        'npm',
        ['pack', '--dry-run', '--json', '--ignore-scripts'],
        { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
      );
      const published = (JSON.parse(raw) as [{ files: { path: string }[] }])[0];
      const paths = published.files.map((f) => f.path);

      const leaked = paths.filter((p) =>
        /(?:^|\/)__tests__(?:\/|$)|\.test\.[cm]?[jt]sx?$|\.tsbuildinfo/.test(p)
      );
      expect({ package: pkg.content.name, leaked }).toEqual({
        package: pkg.content.name,
        leaked: [],
      });
    });
  });

  // The theme reads the plugin's global data by name. The plugin owns that name
  // as PLUGIN_NAME, but the theme cannot import it: doing so would turn a
  // types-only devDependency into a runtime one. So the string is duplicated,
  // and if the two ever drift the copy button silently renders nothing --
  // usePluginData just returns undefined. Compared as source text to keep this
  // hermetic (constants.ts pulls in ESM-only string-width).
  it('keeps the theme in sync with the plugin name it reads global data by', async () => {
    const constants = await fs.readFile(
      'packages/docusaurus-plugin-llms-txt/src/constants.ts',
      'utf8'
    );
    const consumer = await fs.readFile(
      'packages/docusaurus-theme-llms-txt/src/theme/CopyPageContent/index.tsx',
      'utf8'
    );

    const declared = /PLUGIN_NAME\s*=\s*'([^']+)'/.exec(constants)?.[1];
    const used = /usePluginData\(\s*'([^']+)'/.exec(consumer)?.[1];

    expect(declared).toBeDefined();
    expect(used).toBeDefined();
    expect(used).toBe(declared);
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
