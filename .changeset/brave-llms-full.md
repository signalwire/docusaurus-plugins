---
'@signalwire/docusaurus-plugin-llms-txt': minor
---

Add support for generating llms-full.txt with complete markdown content

- Added new `enableLlmsFullTxt` configuration option (defaults to false)
- When enabled, generates an additional `llms-full.txt` file that starts with the complete llms.txt
  content, followed by the full processed markdown content of each document
- The llms-full.txt follows the llms.txt standard format with the index at the top and full content
  appended below
- Automatically enables `enableMarkdownFiles` when `enableLlmsFullTxt` is true to ensure markdown
  files are available
- Reads markdown content from generated files rather than storing in cache, keeping cache size
  minimal
- Updated CLI clean command to also remove llms-full.txt file when cleaning
