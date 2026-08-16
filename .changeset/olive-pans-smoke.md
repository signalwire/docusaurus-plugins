---
'@signalwire/docusaurus-plugin-llms-txt': minor
'@signalwire/docusaurus-theme-llms-txt': minor
---

Support React 19 alongside 18, raise the Docusaurus floor, and stop shipping Docusaurus as a runtime
dependency.

**Breaking — check your peer dependencies before upgrading.**

- `@docusaurus/core` is now required to be `^3.9.0 || ^4.0.0` (was `^3.0.0`). Docusaurus only gained
  React 19 support in 3.7 and dropped Node 18 in 3.9, so the old range advertised combinations that
  could not actually work. Docusaurus v4 is pre-accepted so upgrading to it will not trip a
  peer-dependency error.
- The theme now declares `react`/`react-dom` as `^18.0.0 || ^19.0.0`, matching
  `@docusaurus/theme-classic`. The previous `^18.0.0` cap was wrong: the package already shipped
  React 19 types and was used on React 19 sites, so npm and pnpm users hit a peer conflict.
- `@docusaurus/core` and `@docusaurus/theme-common` moved from `dependencies` to `peerDependencies`
  on the theme, and the plugin now declares peers for `@docusaurus/logger`, `@docusaurus/utils` and
  `@docusaurus/utils-validation` (previously resolved only by hoisting). Installing this theme no
  longer pulls a second copy of Docusaurus into your `node_modules`.
- Minimum Node is now 20, matching Docusaurus 3.9+.

**Fixed**

- The ChatGPT dropdown icon crashed on any fresh install. The theme depends on `react-icons@^5.5.0`,
  and 5.7.0 removed `SiOpenai` (Simple Icons dropped the OpenAI logo), so the import resolved to
  `undefined` and React threw "Element type is invalid". Now uses `RiOpenaiFill`.
- The plugin no longer imports the `commander` type `CommanderStatic`, a commander@5-only name that
  would break when Docusaurus bumps commander. The CLI argument type is derived from Docusaurus's
  own `Plugin` interface instead.
- Declared `remark-parse`, `hast-util-to-mdast` and `@types/mdast`, which the plugin imported
  without declaring. These previously resolved only via hoisting and would fail under pnpm or any
  strict node_modules layout.

**Packaging**

- Test files are no longer published. The theme ships `src/theme` as the TypeScript swizzle
  template, so a co-located test would have been copied into users' sites by
  `docusaurus swizzle --typescript`.
- `lib/.tsbuildinfo` is no longer published. It is TypeScript's incremental build cache and was the
  single largest file in both tarballs: unpacked size drops from 204KB to 111KB (theme) and 473KB to
  366KB (plugin).
