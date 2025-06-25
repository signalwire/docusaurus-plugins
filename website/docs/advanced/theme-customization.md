---
id: theme-customization
title: Theme Customization
sidebar_label: Theme Customization
---

# Theme Customization

Customize the look and feel of your Docusaurus site with themes.

## Understanding Themes

Themes in Docusaurus control:
- Layout components
- CSS styles
- React components
- Site structure

## Swizzling Components

Swizzling allows you to customize theme components:

```bash
npm run swizzle @docusaurus/theme-classic Footer
```

### Safe vs Unsafe Swizzling

- **Safe**: Components designed for customization
- **Unsafe**: Internal components that may change

## Custom CSS

Add custom styles in `src/css/custom.css`:

```css
:root {
  --ifm-color-primary: #2e8555;
  --ifm-color-primary-dark: #29784c;
}
```

## Creating Custom Themes

Build your own theme by extending the classic theme:

```javascript
module.exports = {
  themes: [
    '@docusaurus/theme-classic',
    './src/theme/custom-theme'
  ]
};
```