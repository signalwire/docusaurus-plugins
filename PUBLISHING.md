# Publishing Guide

This guide covers the complete process for publishing your Docusaurus plugins to npm.

## Prerequisites

### 1. NPM Account Setup

```bash
# Check if you're logged in
pnpm npm:check

# Login if needed
pnpm npm:login
```

### 2. Package Name Configuration

Before publishing, update the package names in:

- `packages/docusaurus-plugin-llms-txt/package.json` - Change `@your-org` to your actual npm
  organization
- Update the repository URLs to your actual GitHub repository

### 3. Initial Preparation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build:packages

# Run tests and linting
pnpm test
pnpm lint
```

## Publishing Process

### Option 1: Using Changesets (Recommended)

Changesets provide automated versioning and changelog generation:

#### Step 1: Create a Changeset

```bash
pnpm changeset
```

This will:

- Ask you which packages changed
- Ask for the type of change (patch, minor, major)
- Ask for a description of the changes
- Create a changeset file in `.changeset/`

#### Step 2: Version and Publish

```bash
# Update package versions and generate changelogs
pnpm changeset:version

# Install updated dependencies
pnpm install

# Publish to npm
pnpm changeset:publish
```

### Option 2: Manual Publishing

If you prefer manual control:

#### Step 1: Update Versions Manually

Edit `packages/*/package.json` files to bump versions following semantic versioning:

- **Patch** (0.0.X): Bug fixes
- **Minor** (0.X.0): New features (backward compatible)
- **Major** (X.0.0): Breaking changes

#### Step 2: Build and Test

```bash
pnpm prerelease
```

#### Step 3: Publish Individual Packages

```bash
# Navigate to the package directory
cd packages/docusaurus-plugin-llms-txt

# Publish to npm
npm publish
```

### Option 3: Prerelease Versions

#### Snapshot Releases (Quick Testing)

For testing or pre-release versions without Git commits:

##### Canary Releases

```bash
pnpm canary
```

Creates versions like `1.0.0-canary-20241204123456` with the `canary` npm tag.

##### Alpha Releases

```bash
pnpm alpha
```

Creates versions like `1.0.0-alpha-20241204123456` with the `alpha` npm tag.

##### Beta Releases

```bash
pnpm beta
```

Creates versions like `1.0.0-beta-20241204123456` with the `beta` npm tag.

##### Dev Releases

```bash
pnpm dev:release
```

Creates versions like `1.0.0-dev-20241204123456` with the `dev` npm tag.

#### Full Prerelease Mode (Long-term Testing)

For longer prerelease cycles with Git tracking:

##### Enter Prerelease Mode

```bash
# Choose your tag: alpha, beta, rc, etc.
pnpm prerelease:enter alpha

# Version packages (creates 1.0.0-alpha.0, 1.0.0-alpha.1, etc.)
pnpm prerelease:version

# Commit changes
git add .
git commit -m "Enter alpha prerelease"

# Publish with the specified tag
pnpm prerelease:publish
```

##### Continue Releasing Prereleases

```bash
# Add changesets as normal
pnpm changeset

# Version packages (increments prerelease number)
pnpm prerelease:version

# Commit and publish
git add .
git commit -m "Version alpha packages"
pnpm prerelease:publish
```

##### Exit Prerelease Mode

```bash
# Exit prerelease mode
pnpm prerelease:exit

# Version packages (removes prerelease suffix)
pnpm prerelease:version

# Commit and publish to latest
git add .
git commit -m "Exit prerelease and release stable version"
pnpm prerelease:publish
```

#### Installing Prerelease Versions

Users can install specific prerelease versions:

```bash
# Install specific tag
npm install @your-org/package@alpha
npm install @your-org/package@beta
npm install @your-org/package@dev
npm install @your-org/package@canary

# Install specific version
npm install @your-org/package@1.0.0-alpha.0
```

#### Best Practices for Prereleases

1. **Use branches**: Run prereleases from a separate branch, not main
2. **Choose appropriate tags**:
   - `alpha`: Early testing, potentially unstable
   - `beta`: Feature complete, testing for bugs
   - `canary`: Nightly/continuous releases
   - `dev`: Development builds
   - `rc`: Release candidate, nearly ready for production
3. **Communicate clearly**: Document which prerelease channel users should use
4. **Clean up**: Remember to exit prerelease mode when done

## Publishing Workflow

### Pre-publish Checklist

Run this command to verify everything is ready:

```bash
pnpm publish:check
```

This runs the `prepublishOnly` script which:

- Cleans build artifacts
- Rebuilds the package
- Runs linting
- Runs type checking

### Package Configuration

Each package should have these key fields in `package.json`:

```json
{
  "name": "@your-org/package-name",
  "version": "1.0.0",
  "description": "Clear description",
  "main": "./lib/index.js",
  "types": "./lib/public/index.d.ts",
  "files": ["lib", "README.md", "CHANGELOG.md"],
  "keywords": ["docusaurus", "plugin", "..."],
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  },
  "peerDependencies": {
    "@docusaurus/core": "^3.10.0"
  }
}
```

### Monorepo Publishing

The setup automatically handles:

- ✅ Independent versioning for each package
- ✅ Automatic dependency updates between internal packages
- ✅ Changelog generation
- ✅ Git tag creation
- ✅ Build verification before publishing

## NPM Organization Setup

If you want to publish under an organization (recommended):

### 1. Create NPM Organization

```bash
npm org create your-org-name
```

### 2. Update Package Names

Change all package names from `@your-org/` to `@your-actual-org/`

### 3. Set Access Level

For public packages under an organization:

```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

## Version Management

### Semantic Versioning

Follow these conventions:

- **1.0.0** → **1.0.1**: Bug fixes
- **1.0.0** → **1.1.0**: New features (backward compatible)
- **1.0.0** → **2.0.0**: Breaking changes

### Changelog Format

Changesets automatically generate changelogs, but they follow this format:

```markdown
## 1.1.0

### Minor Changes

- abc123: Add new feature X
- def456: Improve performance of Y

### Patch Changes

- ghi789: Fix bug in Z
```

## Local Publishing Only

This project uses local publishing only for better control over releases. All publishing should be
done from your local machine, not through CI/CD.

### Why Local Publishing?

1. **Full control**: You decide exactly when to publish
2. **Immediate feedback**: See errors and fix them in real-time
3. **No CI complexity**: No need to manage secrets or debug workflow failures
4. **Safer**: Less chance of accidental publishes from automated processes

### Publishing Steps

1. **Ensure you're on the main branch with latest changes**:

   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create a changeset for your changes**:

   ```bash
   pnpm changeset
   ```

3. **Version the packages**:

   ```bash
   pnpm changeset:version
   ```

4. **Commit the version changes**:

   ```bash
   git add .
   git commit -m "chore: version packages"
   ```

5. **Build and test everything**:

   ```bash
   pnpm prerelease
   ```

6. **Publish to npm**:

   ```bash
   pnpm changeset:publish
   ```

7. **Push the version tags and commits**:
   ```bash
   git push --follow-tags origin main
   ```

## Manual Commands Reference

### Core Publishing Commands

```bash
# Check what would be published
pnpm publish:check

# Build all packages
pnpm build:packages

# Test everything before publishing
pnpm prerelease

# Create a changeset
pnpm changeset

# Version packages
pnpm changeset:version

# Publish to npm
pnpm changeset:publish

# Check npm login status
pnpm npm:check

# Login to npm
pnpm npm:login
```

### Snapshot Prerelease Commands

```bash
# Canary release (snapshot with timestamp)
pnpm canary

# Alpha release (snapshot with timestamp)
pnpm alpha

# Beta release (snapshot with timestamp)
pnpm beta

# Dev release (snapshot with timestamp)
pnpm dev:release
```

### Full Prerelease Mode Commands

```bash
# Enter prerelease mode (specify tag: alpha, beta, rc, etc.)
pnpm prerelease:enter <tag>

# Exit prerelease mode
pnpm prerelease:exit

# Version packages in prerelease mode
pnpm prerelease:version

# Publish prerelease packages
pnpm prerelease:publish
```

## Troubleshooting

### Common Issues

**"npm ERR! 403 Forbidden"**

- Check if you're logged in: `pnpm npm:check`
- Verify package name isn't taken
- Check organization permissions

**"npm ERR! Package already exists"**

- Version number already published
- Update version in package.json
- Or use `pnpm changeset` to manage versions

**Build failures before publish**

- Run `pnpm clean` then `pnpm build:packages`
- Check TypeScript errors: `pnpm type-check`
- Check linting: `pnpm lint`

**Changeset not detecting changes**

- Ensure you have uncommitted changes
- Run `git status` to verify changes exist
- Check that you're in a git repository

### Verification

After publishing, verify your package:

```bash
# Check package info
npm info @your-org/docusaurus-plugin-llms-txt

# Install in a test project
npm install @your-org/docusaurus-plugin-llms-txt
```

## Best Practices

1. **Always test before publishing**

   ```bash
   pnpm prerelease
   ```

2. **Use semantic versioning consistently**
3. **Write clear changeset descriptions**
4. **Keep README and documentation updated**
5. **Test package installation in a separate project**
6. **Use canary releases for testing**
7. **Monitor package downloads and issues**

## Post-Publishing

After successful publishing:

1. **Update documentation** if needed
2. **Announce the release** in relevant channels
3. **Monitor for issues** in GitHub issues
4. **Test the published package** in a real project
5. **Update examples** if APIs changed

## Support

For questions about publishing:

- Check [npm documentation](https://docs.npmjs.com/)
- Review [Changesets documentation](https://github.com/changesets/changesets)
- Open an issue in this repository
