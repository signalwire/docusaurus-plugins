---
slug: plugin-testing-post
title: Plugin Testing and Classification
authors: [developer]
tags: [plugin, classification, testing]
---

# Plugin Testing and Classification

This is another test post to ensure our standalone blog plugin instance creates multiple routes that can be properly classified by the LLMs plugin.

<!--truncate-->

## Multiple Blog Routes

Having multiple blog posts in the standalone blog instance helps verify:

- Route enumeration works correctly
- Each blog post gets classified as blog content
- Plugin information is preserved during route processing
- Content filtering respects the `includeBlog` setting

## Expected Behavior

When the LLMs plugin processes this content:

1. It should identify this as blog content
2. Plugin name should be '@docusaurus/plugin-content-blog'
3. Plugin ID should be 'standalone-blog'
4. Content should be included when `includeBlog: true`
5. Content should be excluded when `includeBlog: false`