---
'@signalwire/docusaurus-plugin-llms-txt': patch
'@signalwire/docusaurus-theme-llms-txt': patch
---

Code cleanup and cache optimization:

- Remove dead code (className prop, normalizePathname export, CopyContentData export)
- Optimize cache implementation (replace over-engineered promise cache with minimal in-memory cache)
- Fix resize re-fetch bug (component no longer re-fetches data when switching between mobile/desktop
  views)
- Reduce code size by 47% in useCopyContentData hook
- Changed the location of the CopyButtonContent component. The theme now swizzles DocItem/Layout and
  conditionally puts the Copy button content component after it or below it
