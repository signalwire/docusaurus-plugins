/**
 * Copyright (c) SignalWire, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { ReactNode } from 'react';

// Stands in for `@docusaurus/Translate`. With no translation files loaded, the
// real component falls back to rendering `children` and substituting
// {placeholders} from `values` -- which is exactly what tests should see.
interface TranslateProps {
  children?: ReactNode;
  id?: string;
  values?: Record<string, string | number>;
}

export default function Translate({
  children,
  id,
  values,
}: TranslateProps): ReactNode {
  if (children === undefined) {
    return id ?? null;
  }

  if (values && typeof children === 'string') {
    return children.replace(/\{(?<key>\w+)\}/g, (match, key: string) =>
      key in values ? String(values[key]) : match
    );
  }

  return children;
}

export function translate(
  { message, id }: { message?: string; id?: string; description?: string },
  values?: Record<string, string | number>
): string {
  const base = message ?? id ?? '';
  if (!values) {
    return base;
  }
  return base.replace(/\{(?<key>\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}
