---
'@signalwire/docusaurus-plugin-llms-txt': patch
---

Decouple enableLlmsFullTxt from enableMarkdownFiles and support in-memory content processing

**New Features:**

- Move `enableLlmsFullTxt` to `content.enableLlmsFullTxt` for better organization
- Remove forced coupling where `enableLlmsFullTxt: true` automatically enabled markdown files
- Support in-memory content processing when `enableMarkdownFiles: false` but
  `enableLlmsFullTxt: true`
- Hash-based change detection now works regardless of markdown file settings
- Memory-efficient processing when only llms-full.txt is needed
- Independent control over markdown file generation and llms-full.txt creation

This allows users to generate llms-full.txt without creating individual markdown files, perfect for
scenarios where you only need the consolidated output.
