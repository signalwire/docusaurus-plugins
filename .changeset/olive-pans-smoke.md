---
'@signalwire/docusaurus-plugin-llms-txt': minor
'@signalwire/docusaurus-theme-llms-txt': minor
---

Support React 19 alongside 18, raise the Docusaurus floor, and stop shipping Docusaurus as a runtime
dependency.

**Breaking — check your peer dependencies before upgrading.**

- `@docusaurus/core` is now required to be `^3.10.0` (was `^3.0.0`). Docusaurus only gained React 19
  support in 3.7 and dropped Node 18 in 3.9, so the old range advertised combinations that could not
  actually work. Version 3.10 is the compatibility baseline exercised by this release.
- The theme now declares `react`/`react-dom` as `^18.0.0 || ^19.0.0`, matching
  `@docusaurus/theme-classic`. The previous `^18.0.0` cap was wrong: the package already shipped
  React 19 types and was used on React 19 sites, so npm and pnpm users hit a peer conflict.
- `@docusaurus/core` and `@docusaurus/theme-common` moved from `dependencies` to `peerDependencies`
  on the theme. Installing this theme no longer pulls a second copy of Docusaurus into your
  `node_modules`.
- The plugin now declares `@docusaurus/logger`, `@docusaurus/utils` and
  `@docusaurus/utils-validation` as `dependencies` (previously resolved only by hoisting). These are
  libraries rather than the build tool, and sites never install them by name, so declaring them as
  peers would leave them unmet under Yarn Classic and unresolved under pnpm. Keeping
  `@docusaurus/core` as the only peer prevents a third-party package from pulling a second copy of
  core. First-party Docusaurus packages instead pin core as an exact lockstep dependency, which a
  third-party package cannot do.
- Minimum Node is now 20, matching the Docusaurus 3.10 baseline.

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
- Declared `tslib` on the theme. The build sets `importHelpers`, so 15 files in the published `lib/`
  require it at runtime; it had been supplied only through `@docusaurus/core`'s own dependency tree,
  which moving core to a peer removed. Under pnpm or a nested npm layout the theme failed to render
  with `Cannot find module 'tslib'`.
- GFM options are now applied consistently. Omitting the `markdown` key entirely silently dropped
  every GFM default, so `{llmsTxt: {...}}` and `{markdown: {}, llmsTxt: {...}}` emitted different
  Markdown: the first reached `remark-gfm` with none of `stringLength`, `tablePipeAlign`,
  `tableCellPadding` or `singleTilde`, misaligning table pipes for CJK and emoji content.
  `undefined` now resolves to the same defaults as an explicit `remarkGfm: true`.

**Packaging**

- Test files are no longer published. The theme ships `src/theme` as the TypeScript swizzle
  template, so a co-located test would have been copied into users' sites by
  `docusaurus swizzle --typescript`.
- TypeScript swizzles now resolve the theme's hooks, types, and icon dependencies through exported
  package entry points. Those source helpers are included in the tarball, so an ejected
  `CopyPageContent` compiles in a consuming site under pnpm's strict dependency layout.
- The `@theme/*` module declarations now ship with the theme that provides those components. If your
  `tsconfig.json` explicitly lists `@signalwire/docusaurus-plugin-llms-txt` in
  `compilerOptions.types`, replace it with `@signalwire/docusaurus-theme-llms-txt`.
- The plugin's root TypeScript entry point now uses its generated declarations. Published consumers
  can resolve `Options` and the default plugin signature without reaching an unshipped `src/types`
  directory, and the declarations stay aligned with the runtime exports.
- `lib/.tsbuildinfo` is no longer published. It is TypeScript's incremental build cache and was the
  single largest file in both tarballs: unpacked size drops from 204KB to 111KB (theme) and 473KB to
  366KB (plugin).
