# @signalwire/docusaurus-theme-llms-txt

## 1.0.0-alpha.2

### Patch Changes

- Code cleanup and cache optimization:
  - Remove dead code (className prop, normalizePathname export, CopyContentData export)
  - Optimize cache implementation (replace over-engineered promise cache with minimal in-memory
    cache)
  - Fix resize re-fetch bug (component no longer re-fetches data when switching between
    mobile/desktop views)
  - Reduce code size by 47% in useCopyContentData hook
  - Changed location of componen to appear after breadcrumbs
  - Theme now swizzles doc layout instead of DocItem/Content

## 1.0.0-alpha.1

### Patch Changes

- fix styling issue

## 1.0.0-alpha.0

### Major Changes

- Alpha Release
