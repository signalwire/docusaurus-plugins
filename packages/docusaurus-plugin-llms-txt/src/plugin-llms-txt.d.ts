/**
 * @signalwire/docusaurus-plugin-llms-txt
 *
 * TypeScript declarations for theme components provided by the llms-txt plugin.
 * This file contains module declarations for @theme/* components that are part
 * of the llms-txt ecosystem.
 */

declare module '@signalwire/docusaurus-plugin-llms-txt' {
  import type { LoadContext, Plugin, PluginModule } from '@docusaurus/types';
  import type { Options } from './types/public';

  export type { Options };

  export const getSwizzleConfig: PluginModule['getSwizzleConfig'];

  export default function pluginLlmsTxt(
    context: LoadContext,
    options: Options
  ): Plugin<undefined>;
}

// Main CopyPageContent component
declare module '@theme/CopyPageContent' {
  import type { ReactNode } from 'react';

  /**
   * Copy-page-button options after defaults have been merged in.
   *
   * Mirrors `ResolvedCopyPageContentOptions` in
   * @signalwire/docusaurus-theme-llms-txt (src/hooks/useCopyButtonConfig.ts).
   * It is restated here rather than imported because these `@theme/*`
   * declarations intentionally live in the plugin package, which does not
   * depend on the theme.
   */
  export interface ResolvedCopyPageContentOptions {
    readonly buttonLabel: string;
    readonly display: {
      readonly docs: boolean;
      readonly excludeRoutes: readonly string[];
    };
    readonly contentStrategy: 'prefer-markdown' | 'html-only';
    readonly viewMarkdown: boolean;
    readonly chatGPT: { readonly enabled: boolean; readonly prompt: string };
    readonly claude: { readonly enabled: boolean; readonly prompt: string };
  }

  export interface Props {
    readonly isMobile?: boolean;
  }

  export default function CopyPageContent(props: Props): ReactNode;
}

// DocBreadcrumbs - wrapper that adds CopyPageContent button next to breadcrumbs
// This is a wrapped component that extends the default Docusaurus breadcrumbs
declare module '@theme/DocBreadcrumbs' {
  import type { ReactNode } from 'react';

  export type Props = Record<string, never>;

  export default function DocBreadcrumbs(props: Props): ReactNode;
}

// CopyButton subcomponent
declare module '@theme/CopyPageContent/CopyButton' {
  import type { ReactNode } from 'react';
  import type { ResolvedCopyPageContentOptions } from '@theme/CopyPageContent';

  export interface Props {
    readonly copyStatus: 'idle' | 'success' | 'error';
    readonly finalConfig: ResolvedCopyPageContentOptions;
    readonly isOpen: boolean;
    readonly onMainAction: () => void | Promise<void>;
    readonly onDropdownToggle: () => void;
  }

  export default function CopyButton(props: Props): ReactNode;
}

// DropdownMenu components
declare module '@theme/CopyPageContent/DropdownMenu' {
  import type { ReactNode } from 'react';
  import type { ResolvedCopyPageContentOptions } from '@theme/CopyPageContent';

  export interface Props {
    readonly isOpen: boolean;
    readonly finalConfig: ResolvedCopyPageContentOptions;
    readonly onAction: (action: string) => void;
    readonly isMobile?: boolean;
    readonly hasMarkdown?: boolean;
  }

  export default function DropdownMenu(props: Props): ReactNode;
}

declare module '@theme/CopyPageContent/DropdownMenu/MenuItem' {
  import type { ReactNode } from 'react';

  export interface Props {
    readonly icon: ReactNode;
    readonly onClick: () => void;
    readonly children: ReactNode;
    readonly description?: string;
  }

  export default function MenuItem(props: Props): ReactNode;
}

// Icon components
declare module '@theme/CopyPageContent/Icons' {
  export { default as ChevronIcon } from '@theme/CopyPageContent/Icons/ChevronIcon';
  export { default as MarkdownIcon } from '@theme/CopyPageContent/Icons/MarkdownIcon';
  export { default as HtmlIcon } from '@theme/CopyPageContent/Icons/HtmlIcon';
  export { default as CopyIcon } from '@theme/CopyPageContent/Icons/CopyIcon';
  export { default as ChatGPTIcon } from '@theme/CopyPageContent/Icons/ChatGPTIcon';
  export { default as ClaudeIcon } from '@theme/CopyPageContent/Icons/ClaudeIcon';
}

declare module '@theme/CopyPageContent/Icons/ChevronIcon' {
  import type { ReactNode } from 'react';
  export interface Props {
    readonly isOpen?: boolean;
  }
  export default function ChevronIcon(props: Props): ReactNode;
}

declare module '@theme/CopyPageContent/Icons/MarkdownIcon' {
  import type { ReactNode } from 'react';
  export default function MarkdownIcon(): ReactNode;
}

declare module '@theme/CopyPageContent/Icons/HtmlIcon' {
  import type { ReactNode } from 'react';
  export default function HtmlIcon(): ReactNode;
}

declare module '@theme/CopyPageContent/Icons/CopyIcon' {
  import type { ReactNode } from 'react';
  export default function CopyIcon(): ReactNode;
}

declare module '@theme/CopyPageContent/Icons/ChatGPTIcon' {
  import type { ReactNode } from 'react';
  export default function ChatGPTIcon(): ReactNode;
}

declare module '@theme/CopyPageContent/Icons/ClaudeIcon' {
  import type { ReactNode } from 'react';
  export default function ClaudeIcon(): ReactNode;
}
