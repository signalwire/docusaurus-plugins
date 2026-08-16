# Docusaurus Plugins Monorepo

A comprehensive collection of Docusaurus plugins built with TypeScript in a modern monorepo
structure.

## 📦 Packages

| Package                                                                           | Version                                                                     | Description                                                               |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [`@signalwire/docusaurus-plugin-llms-txt`](./packages/docusaurus-plugin-llms-txt) | ![npm](https://img.shields.io/npm/v/@signalwire/docusaurus-plugin-llms-txt) | Generate Markdown versions of Docusaurus pages and an llms.txt index file |
| [`@signalwire/docusaurus-theme-llms-txt`](./packages/docusaurus-theme-llms-txt)   | ![npm](https://img.shields.io/npm/v/@signalwire/docusaurus-theme-llms-txt)  | Theme components for llms.txt plugin with copy-to-clipboard functionality |

## 🚀 Quick Start

### Installation

```bash
npm install @signalwire/docusaurus-plugin-llms-txt @signalwire/docusaurus-theme-llms-txt
# or
yarn add @signalwire/docusaurus-plugin-llms-txt @signalwire/docusaurus-theme-llms-txt
```

### Usage

Add to your `docusaurus.config.ts`:

```typescript
import type { Config } from '@docusaurus/types';

const config: Config = {
  plugins: [
    [
      '@signalwire/docusaurus-plugin-llms-txt',
      {
        // Plugin options
      },
    ],
  ],
  themes: ['@signalwire/docusaurus-theme-llms-txt'],
};

export default config;
```

## 🏗 Development

### Prerequisites

- Node.js ≥ 20.0.0
- Yarn 1.22.x (Yarn Classic)

### Setup

```bash
# Clone the repository
git clone https://github.com/signalwire/docusaurus-plugins.git
cd docusaurus-plugins

# Install dependencies
yarn install

# Build all packages
yarn build:packages
```

### Development Workflow

```bash
# Start development with watch mode
yarn dev

# Run tests
yarn test

# Lint code
yarn lint

# Type check
yarn type-check

# Format code
yarn format
```

### Adding New Packages

1. Create a new directory in `packages/`
2. Add a `package.json` with standard scripts
3. Lerna will automatically detect and include it in all operations

## 📋 Scripts Reference

| Command               | Description                    |
| --------------------- | ------------------------------ |
| `yarn dev`            | Start development server       |
| `yarn build`          | Build all packages and website |
| `yarn build:packages` | Build all packages only        |
| `yarn test`           | Run tests in all packages      |
| `yarn lint`           | Lint all packages              |
| `yarn format`         | Format all code                |
| `yarn clean`          | Clean build artifacts          |

## 📤 Publishing

This monorepo uses [Changesets](https://github.com/changesets/changesets) for version management and
publishing.

### Quick Publishing

```bash
# Create a changeset
yarn changeset

# Version packages and update changelogs
yarn changeset:version

# Publish to npm
yarn changeset:publish
```

For detailed publishing instructions, see [PUBLISHING.md](./PUBLISHING.md).

## 🏛 Architecture

### Monorepo Structure

```
docusaurus-plugins/
├── packages/                    # Published packages
│   ├── docusaurus-plugin-llms-txt/
│   └── docusaurus-theme-llms-txt/
├── website/                     # Demo/documentation site
├── .changeset/                  # Changeset configuration
├── lerna.json                   # Lerna configuration
└── package.json                 # Root package with workspaces
```

### Technology Stack

- **Package Management**: Yarn Workspaces + Lerna
- **Build System**: TypeScript with project references
- **Version Management**: Changesets
- **Code Quality**: ESLint + Prettier
- **Testing**: Jest
- **Documentation**: Docusaurus

### Key Features

- ✅ **Independent Versioning**: Each package can be versioned separately
- ✅ **Automated Publishing**: Changesets handle versioning and publishing
- ✅ **Type Safety**: Full TypeScript support with strict configuration
- ✅ **Code Quality**: Automated linting, formatting, and testing
- ✅ **Auto-Discovery**: New packages automatically included in all operations
- ✅ **Modern ES Modules**: Built for modern JavaScript environments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run `yarn prerelease` to verify everything works
6. Create a changeset with `yarn changeset`
7. Submit a pull request

### Development Guidelines

- Follow the existing code style (enforced by Prettier/ESLint)
- Add tests for new functionality
- Update documentation for API changes
- Use semantic commit messages
- Create changesets for all user-facing changes

## 📜 License

MIT © [SignalWire](https://github.com/signalwire)

## 🔗 Links

- [Documentation](https://signalwire.github.io/docusaurus-plugins/)
- [NPM Organization](https://www.npmjs.com/org/signalwire)
- [GitHub Issues](https://github.com/signalwire/docusaurus-plugins/issues)
- [Changesets Documentation](https://github.com/changesets/changesets)
- [Docusaurus Documentation](https://docusaurus.io/)

---

## Package Details

### [@signalwire/docusaurus-plugin-llms-txt](./packages/docusaurus-plugin-llms-txt)

Generate Markdown versions of Docusaurus HTML pages and create an `llms.txt` index file for LLM
consumption.

**Key Features:**

- 🔄 HTML to Markdown conversion
- 📝 llms.txt index generation
- 🗂️ Hierarchical organization
- ⚡ Smart caching
- 🎯 Content filtering

[View Package →](./packages/docusaurus-plugin-llms-txt)

### [@signalwire/docusaurus-theme-llms-txt](./packages/docusaurus-theme-llms-txt)

Theme package providing UI components for the llms.txt plugin, including a copy-to-clipboard button
for page content.

**Key Features:**

- 📋 Copy page content as Markdown
- 🤖 Format for ChatGPT and Claude
- 🎯 Smart detection of page title
- 📱 Responsive mobile/desktop layouts
- 🔧 Fully swizzlable components

**Architecture:**

- Uses DOM-based detection to identify page titles (H1 in `<header>` tags)
- Global data fetching with shared cache for performance
- Integrates seamlessly with Docusaurus theme system

[View Package →](./packages/docusaurus-theme-llms-txt)
