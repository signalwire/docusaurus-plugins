---
'@signalwire/docusaurus-plugin-llms-txt': patch
'@signalwire/docusaurus-theme-llms-txt': patch
---

Major architecture improvements for better plugin compatibility:

**Component Changes:**

- Switched from ejecting `DocItem/Layout` to wrapping `DocBreadcrumbs`
  - This prevents conflicts with other plugins that customize the layout
  - Uses WRAP pattern instead of EJECT for better compatibility
- Changed internal import from `@theme-original` to `@theme-init` following Docusaurus best
  practices for theme enhancers

**Improvements:**

- Fixed type declarations to accurately reflect component props
  - Removed unused `className` prop from `CopyPageContent`
  - Fixed `DocBreadcrumbs` type declaration for proper wrapping support
- Added `margin-left: auto` to ensure copy button always aligns right in desktop view
- Fixed package publishing configuration
  - Added `src/theme` directory to published files for TypeScript swizzling support
  - Updated devDependencies for proper type resolution
  - Changed `react-icons` from exact version to version range

**Documentation:**

- Updated README with correct swizzle examples for `DocBreadcrumbs`
- Added explanation of `@theme-init` vs `@theme-original` usage
- Updated swizzle configuration to reflect new safe wrapping pattern

**Compatibility:**

- Now compatible with plugins like `docusaurus-plugin-openapi-docs` that also customize layouts
- Follows official Docusaurus theme enhancer pattern (similar to `@docusaurus/theme-live-codeblock`)
- Users can now safely wrap our enhanced breadcrumbs with `@theme-original/DocBreadcrumbs`
