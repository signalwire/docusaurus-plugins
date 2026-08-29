---
'@signalwire/docusaurus-plugin-llms-txt': patch
---

Exclude Docusaurus docs, blog posts, and MDX pages marked `unlisted` from `llms.txt` and
`llms-full.txt` while retaining their direct Markdown output.

Legacy caches without visibility metadata are invalidated so CLI regeneration requires a fresh
Docusaurus build instead of exposing previously unlisted content.
