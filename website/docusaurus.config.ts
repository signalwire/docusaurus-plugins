import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type { PluginOptions } from '@signalwire/docusaurus-plugin-llms-txt/public';
// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'My Site',
  tagline: 'Dinosaurs are cool',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true,
    experimental_faster: true,
    experimental_router: 'browser',
  },

  // Set the production url of your site here
  url: 'https://your-docusaurus-site.example.com',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'SignalWire', // Usually your GitHub org/user name.
  projectName: 'docusaurus-plugins', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    'docusaurus-plugin-sass',
    [
      '@signalwire/docusaurus-plugin-llms-txt',
      {
        // Runtime behavior (top-level)
        logLevel: 3,
        onRouteError: 'throw',
        onSectionError: 'warn',

        // Output generation configuration
        generate: {
          enableMarkdownFiles: true,
          enableLlmsFullTxt: true,
          relativePaths: true,
        },

        // Content inclusion/filtering configuration
        include: {
          includeBlog: true,
          includePages: true,
          includeDocs: true,
          includeVersionedDocs: false,
          includeGeneratedIndex: false,
          excludeRoutes: ['/docs/tutorial-extras/**'],
        },

        // Content structure and organization configuration
        structure: {
          siteTitle: 'My Docusaurus Plugins Collection',
          siteDescription: 'Documentation for Docusaurus plugins',
          sections: [
            {
              id: 'api-docs',
              name: 'API Documentation',
              description: 'Complete API reference and specifications',
              position: 1,
              routes: [
                { route: '/api/**' }
              ]
            },
            {
              id: 'dev-guides',
              name: 'Developer Guides',
              description: 'Tutorials and best practices for developers',
              position: 2
            }
          ],
          optionalLinks: [
            {
              title: 'API Status Page',
              url: 'https://status.example.com',
              description: 'Real-time API status and uptime monitoring'
            },
            {
              title: 'Interactive API Explorer',
              url: 'https://api-explorer.example.com',
              description: 'Test our APIs in an interactive environment'
            },
            {
              title: 'Community Forum',
              url: 'https://forum.example.com',
              description: 'Get help and share knowledge with the community',
            },
            {
              title: 'GitHub Repository',
              url: 'https://github.com/example/repo',
              description: 'Source code and issue tracking',
            }
          ],
        },

        // Content processing and transformation configuration
        processing: {
          routeRules: [
            // Global route rules for cross-cutting concerns only
          ],
          attachments: [
            {
              source: './test-files/test-api.yaml',
              title: 'Payment API OpenAPI Specification',
              description: 'Complete OpenAPI 3.0 specification for our payment processing API',
              sectionId: 'api-docs'
            },
            {
              source: './test-files/webhook-events.json',
              title: 'Webhook Event Schemas',
              description: 'JSON schemas for all webhook events including payment and customer events',
              sectionId: 'api-docs'
            },
            {
              source: './test-files/getting-started.md',
              title: 'Getting Started Guide',
              description: 'Quick start guide for new developers',
              sectionId: 'dev-guides'
            },
            {
              source: './test-files/advanced-guide.mdx',
              title: 'Advanced Payment Processing',
              description: 'Advanced patterns, security best practices, and optimization techniques',
              sectionId: 'dev-guides'
            }
          ],
        },

        // User interface features configuration
        ui: {
          copyPageContent: true,
        },
      } satisfies PluginOptions,
    ],
    // Standalone blog plugin instance
    [
      '@docusaurus/plugin-content-blog',
      {
        id: 'standalone-blog',
        path: 'standalone-blog',
        routeBasePath: 'standalone-blog',
        blogTitle: 'Standalone Blog',
        blogDescription: 'A standalone blog instance for testing plugin classification',
        showReadingTime: true,
      },
    ],
    // Standalone pages plugin instance
    [
      '@docusaurus/plugin-content-pages',
      {
        id: 'standalone-pages',
        path: 'standalone-pages',
        routeBasePath: 'standalone-pages',
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'api',
        path: 'api-docs',
        routeBasePath: 'api',
        sidebarPath: './api-sidebars.ts',
        lastVersion: 'current',
        versions: {
          current: {
            label: 'v3 (Current)',
            banner: 'none',
          },
          v2: {
            label: 'v2',
          },
          v1: {
            label: 'v1',
          },
        },
      },
    ],
  ],

  themes: [
    '@signalwire/docusaurus-theme-llms-txt'
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'My Site',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Tutorial',
        },
        {
          type: 'docSidebar',
          sidebarId: 'apiSidebar',
          docsPluginId: 'api',
          position: 'left',
          label: 'API Docs',
        },
        {
          type: 'docsVersionDropdown',
          docsPluginId: 'api',
          position: 'left',
        },
        { to: '/blog', label: 'Blog', position: 'left' },
        { to: '/standalone-blog', label: 'Standalone Blog', position: 'left' },
        { to: '/standalone-pages', label: 'Standalone Pages', position: 'left' },
        {
          href: 'https://github.com/facebook/docusaurus',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Tutorial',
              to: '/docs/intro',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
            {
              label: 'X',
              href: 'https://x.com/docusaurus',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/facebook/docusaurus',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
