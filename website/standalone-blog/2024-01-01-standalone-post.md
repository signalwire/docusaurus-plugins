---
slug: standalone-blog-post
title: Standalone Blog Post
authors: [admin]
tags: [testing, standalone]
---

# Standalone Blog Post

This is a test post in the standalone blog plugin instance. This content should be classified as a blog post by the LLMs plugin and should have plugin.name set to '@docusaurus/plugin-content-blog'.

<!--truncate-->

## Testing Plugin Classification

This post is specifically created to test that our plugin can correctly identify different content types based on their plugin information:

- **Plugin Type**: Blog
- **Plugin Name**: @docusaurus/plugin-content-blog
- **Plugin ID**: standalone-blog

## Content Details

This standalone blog instance helps us verify that the content classifier in our LLMs plugin correctly distinguishes between:

1. Regular blog posts (from preset)
2. Standalone blog posts (from dedicated plugin)
3. Docs content
4. Pages content

The plugin should process this content when `includeBlog: true` is set in the configuration.