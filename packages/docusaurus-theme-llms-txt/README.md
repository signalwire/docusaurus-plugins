# @signalwire/docusaurus-theme-llms-txt

> Docusaurus theme components for the llms-txt plugin, featuring a customizable copy page button
> with AI integration.

This theme package provides React components and styling for the
`@signalwire/docusaurus-plugin-llms-txt` plugin, including a sophisticated copy page button that
allows users to copy content or share it with AI tools like ChatGPT and Claude.

## Installation

```bash
npm install @signalwire/docusaurus-theme-llms-txt
# or
yarn add @signalwire/docusaurus-theme-llms-txt
```

## Basic Usage

Add the theme to your Docusaurus configuration:

```js
// docusaurus.config.js
export default {
  // ... other config
  themes: ['@signalwire/docusaurus-theme-llms-txt'],
  plugins: [
    [
      '@signalwire/docusaurus-plugin-llms-txt',
      {
        copyPageButton: {
          buttonLabel: 'Copy Page',
          actions: {
            markdown: true,
            ai: {
              chatGPT: true,
              claude: true,
            },
          },
        },
      },
    ],
  ],
};
```

## Components

### CopyPageButton

The main component that provides copy and AI sharing functionality. It automatically integrates with
your content pages.

**Features:**

- Copy raw markdown content
- Share content with ChatGPT or Claude AI
- Dropdown menu with configurable actions
- Success feedback with animations
- Full keyboard accessibility
- Responsive design (desktop dropdown, mobile FAB)

## CSS Customization

The theme uses CSS variables for comprehensive styling control. You can customize the appearance
without swizzling by overriding CSS variables in your custom stylesheet.

### Available CSS Variables

```css
/* Add to your custom CSS file */
.copyButton {
  /* Core Button Colors */
  --llms-copy-bg: transparent; /* Button background */
  --llms-copy-bg-hover: rgba(0, 0, 0, 0.03); /* Button hover background */
  --llms-copy-bg-active: rgba(0, 0, 0, 0.06); /* Button active background */
  --llms-copy-text: var(--ifm-font-color-base); /* Button text color */
  --llms-copy-text-secondary: var(--ifm-color-emphasis-600); /* Secondary text */
  --llms-copy-border: rgba(0, 0, 0, 0.08); /* Button border color */

  /* Layout & Spacing */
  --llms-copy-padding: 9px 12px; /* Button padding */
  --llms-copy-gap: 7px; /* Gap between elements */
  --llms-copy-font-size: 13px; /* Button text size */
  --llms-copy-font-size-dropdown: 14px; /* Dropdown text size */
  --llms-copy-button-min-width: 110px; /* Minimum button width to prevent size changes */
  --llms-copy-button-margin-left: 16px; /* Button left margin */
  --llms-copy-button-margin-bottom: 8px; /* Button bottom margin */

  /* Menu Item Styles */
  --llms-copy-menu-item-padding: 12px 16px; /* Menu item padding */
  --llms-copy-menu-item-gap: 12px; /* Gap between menu item elements */
  --llms-copy-menu-item-border-radius: 8px; /* Menu item border radius */

  /* Icon Styles */
  --llms-copy-icon-size: 16px; /* Main icon size */
  --llms-copy-arrow-icon-size: 12px; /* Dropdown arrow size */
  --llms-copy-icon-container-size: 32px; /* Icon container size */
  --llms-copy-icon-container-bg: rgba(0, 0, 0, 0.06); /* Icon container background */
  --llms-copy-icon-container-border-radius: 6px; /* Icon container border radius */

  /* Typography */
  --llms-copy-font-weight: 400; /* Button font weight */
  --llms-copy-label-weight: 500; /* Menu label font weight */
  --llms-copy-font-size-description: 0.88em; /* Description font size */
  --llms-copy-description-color: var(--ifm-color-emphasis-600); /* Description color */
  --llms-copy-description-line-height: 1.3; /* Description line height */
  --llms-copy-description-gap: 3px; /* Description gap */

  /* Border & Shape */
  --llms-copy-radius: 8px; /* Border radius */
  --llms-copy-border-width: 1px; /* Border width */
  --llms-copy-shadow: none; /* Button shadow */
  --llms-copy-shadow-hover: 0 1px 2px rgba(0, 0, 0, 0.05); /* Hover shadow */

  /* Dropdown Menu */
  --llms-copy-dropdown-bg: var(--ifm-background-surface-color); /* Dropdown background */
  --llms-copy-dropdown-text: var(--ifm-font-color-base); /* Dropdown text */
  --llms-copy-dropdown-hover: var(--ifm-hover-overlay); /* Dropdown hover */
  --llms-copy-dropdown-border: var(--ifm-color-emphasis-300); /* Dropdown border */
  --llms-copy-dropdown-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* Dropdown shadow */
  --llms-copy-dropdown-width: 280px; /* Dropdown width */
  --llms-copy-dropdown-offset: 8px; /* Dropdown vertical offset */
  --llms-copy-dropdown-initial-transform: -10px; /* Dropdown initial transform */
  --llms-copy-dropdown-z-index: 1000; /* Dropdown stacking */

  /* Animation & Transitions */
  --llms-copy-transition: all 0.15s ease; /* General transition timing */
  --llms-copy-animation-duration: 0.3s; /* Success animation duration */
  --llms-copy-animation-timing: ease; /* Animation timing function */
  --llms-copy-arrow-transition: transform 0.2s ease; /* Arrow icon transition */
  --llms-copy-menuitem-transition: background-color 0.15s ease; /* Menu item transition */

  /* States & Interactions */
  --llms-copy-disabled-opacity: 0.6; /* Disabled state opacity */
  --llms-copy-active-scale: 0.98; /* Active state scale */
  --llms-copy-z-index: 10; /* Button stacking */

  /* Loading Spinner */
  --llms-copy-spinner-size: 16px; /* Spinner size */
  --llms-copy-spinner-border-width: 2px; /* Spinner border width */
  --llms-copy-spinner-animation-duration: 0.6s; /* Spinner animation duration */
}
```

### Styling Examples

#### Custom Brand Colors

```css
.copyButton {
  --llms-copy-bg: #f8f9fa;
  --llms-copy-bg-hover: #e9ecef;
  --llms-copy-text: #495057;
  --llms-copy-border: #dee2e6;
}
```

#### Larger Button

```css
.copyButton {
  --llms-copy-padding: 12px 16px;
  --llms-copy-font-size: 14px;
  --llms-copy-icon-size: 18px;
  --llms-copy-icon-container-size: 36px;
  --llms-copy-menu-item-padding: 14px 18px;
}
```

#### Custom Dropdown

```css
.copyButton {
  --llms-copy-dropdown-width: 250px;
  --llms-copy-dropdown-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  --llms-copy-dropdown-bg: #ffffff;
}
```

#### Dark Theme Customization

```css
[data-theme='dark'] .copyButton {
  --llms-copy-bg: transparent;
  --llms-copy-bg-hover: rgba(255, 255, 255, 0.03);
  --llms-copy-bg-active: rgba(255, 255, 255, 0.06);
  --llms-copy-border: rgba(255, 255, 255, 0.08);
  --llms-copy-shadow-hover: 0 1px 2px rgba(0, 0, 0, 0.15);
  --llms-copy-description-color: var(--ifm-color-emphasis-400);
  --llms-copy-icon-container-bg: rgba(255, 255, 255, 0.08);
}
```

## Advanced Usage

### Component Swizzling

This theme provides swizzlable components for advanced customization. Use Docusaurus CLI to safely
customize components:

#### Safe Swizzling (Recommended)

```bash
# Wrap the breadcrumbs to customize button placement (safe)
npx docusaurus swizzle @signalwire/docusaurus-theme-llms-txt DocBreadcrumbs --wrap

# Wrap the copy button for additional functionality (safe - not commonly needed)
npx docusaurus swizzle @signalwire/docusaurus-theme-llms-txt CopyPageButton --wrap
```

**Note:** This plugin uses a WRAP pattern on `DocBreadcrumbs` instead of ejecting layout components.
This prevents conflicts with other plugins that might also modify the documentation layout.

### Custom Component Implementation

After swizzling, you can customize the components:

```tsx
// src/theme/DocBreadcrumbs/index.tsx
import React from 'react';
// Use @theme-original to wrap our enhanced breadcrumbs
import DocBreadcrumbsEnhanced from '@theme-original/DocBreadcrumbs';

export default function DocBreadcrumbs(props) {
  return (
    <div className='my-custom-breadcrumbs-wrapper'>
      <DocBreadcrumbsEnhanced {...props} />
      <span className='my-custom-badge'>Custom Enhancement</span>
    </div>
  );
}
```

**Note:** This plugin uses `@theme-init/DocBreadcrumbs` internally to wrap the base Docusaurus
breadcrumbs. As a user, you should use `@theme-original/DocBreadcrumbs` to wrap our enhanced
version.

### TypeScript Support

Full TypeScript definitions are included:

```tsx
import type { Props as DocBreadcrumbsProps } from '@theme/DocBreadcrumbs';

const CustomBreadcrumbs: React.FC<DocBreadcrumbsProps> = (props) => {
  // Your implementation
};
```

## Configuration Integration

This theme automatically integrates with plugin configuration:

```js
// docusaurus.config.js - Plugin configuration affects theme behavior
{
  copyPageButton: {
    buttonLabel: 'Share Content',
    actions: {
      markdown: true,
      ai: {
        chatGPT: {
          prompt: 'Help me understand this:'
        },
        claude: false  // Disables Claude option
      }
    }
  }
}
```

## Accessibility

The components follow WCAG guidelines:

- Full keyboard navigation support
- ARIA attributes for screen readers
- Focus management for dropdowns
- High contrast support
- Reduced motion respect

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Automatic graceful degradation

## Contributing

This package is part of the `@signalwire/docusaurus-plugins` monorepo. See the
[main repository](https://github.com/signalwire/docusaurus-plugins) for contribution guidelines.

## License

MIT © [SignalWire](https://signalwire.com)

---

**Related Packages:**

- [`@signalwire/docusaurus-plugin-llms-txt`](../docusaurus-plugin-llms-txt) - The main plugin
- [Docusaurus](https://docusaurus.io) - The static site generator
