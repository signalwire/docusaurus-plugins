---
'@signalwire/docusaurus-theme-llms-txt': patch
---

Fix the theme failing to type-check under React 18. `useDropdownState` declared its ref as
`RefObject<HTMLDivElement | null>` — the React 19 `@types/react` shape — which React 18 rejects when
assigned to a `ref` prop, so a site on React 18 that type-checks a swizzled `CopyPageContent` hit
TS2322. Release builds now emit declarations against the lowest supported React types, while CI also
rebuilds and tests against React 19. The package advertises `react: ^18.0.0 || ^19.0.0`, so the
published declaration remains consumable under either major.
