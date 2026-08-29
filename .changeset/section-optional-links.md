---
'@signalwire/docusaurus-plugin-llms-txt': patch
---

Fix section-level `optionalLinks` being dropped from llms.txt. They are now rendered inside their
section (after the section's documents), and a section defining only optional links is no longer
treated as empty.
