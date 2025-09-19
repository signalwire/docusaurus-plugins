# @signalwire/docusaurus-theme-llms-txt

## 0.0.0

### Patch Changes

- Fix Safari clipboard API compatibility issue

  - Implemented unified ClipboardItem approach with Promise-based content
  - Removed browser-specific detection in favor of standards-compliant solution
  - Fixed NotAllowedError that occurred in Safari when copying page content
  - Solution works across all modern browsers (Safari, Chrome, Firefox, Edge)
