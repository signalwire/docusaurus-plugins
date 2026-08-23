# Security Policy

## Reporting a vulnerability

Please report suspected vulnerabilities privately via
[GitHub Security Advisories](https://github.com/signalwire/docusaurus-plugins/security/advisories/new)
rather than opening a public issue.

## How we gate dependencies

CI runs [`actions/dependency-review-action`](https://github.com/actions/dependency-review-action) on
every pull request (`.github/workflows/dependency-review.yml`). It fails a PR that **introduces** a
dependency with a known high-or-worse advisory in the `runtime` scope.

Two deliberate choices are worth explaining, because they differ from a plain `npm audit` gate.

### We gate the change, not the inventory

`pnpm audit` reports the absolute state of the whole tree. That makes an unrelated PR fail for a
transitive advisory it did not introduce and cannot fix, which trains everyone to ignore the check.
Dependency Review compares the base and head of the PR, so it only speaks up about what the PR
actually changed.

This is also what Docusaurus itself does: none of its CI workflows run `npm`/`yarn`/`pnpm audit`.

### We scope to runtime dependencies

Docusaurus is a build tool. It produces static HTML, CSS and JS; there is no server runtime. A CVE
in `webpack-dev-server` or `image-size` describes a threat model that requires access to a
developer's machine at build time, not to anything a visitor to your site can reach.

`fail-on-scopes` therefore stays at its default of `runtime`, and this repo classifies Docusaurus
accordingly:

- published packages declare host-owned framework packages such as `@docusaurus/core` and
  `@docusaurus/theme-common` as **peerDependencies**; directly imported build helpers remain runtime
  dependencies
- the demo website declares them as **devDependencies**

This is the remedy the Docusaurus maintainers themselves recommend — see
[facebook/docusaurus#5501](https://github.com/facebook/docusaurus/issues/5501) and the canonical
[create-react-app#11174](https://github.com/facebook/create-react-app/issues/11174).

## Accepting an advisory that has no fix

Sometimes an advisory has no patched version at any release, or the fix is blocked upstream. Two
current examples in the Docusaurus tree:

- `image-size` — two high advisories, no patched version published; a hard dependency of
  `@docusaurus/mdx-loader`
- `serialize-javascript` via `copy-webpack-plugin` — blocked on a Node version bump, resolved in
  Docusaurus v4 ([facebook/docusaurus#11801](https://github.com/facebook/docusaurus/issues/11801))

When one of these lands in the runtime scope and blocks a PR:

1. Confirm it is genuinely unfixable — check whether a patched version exists and whether the range
   that reaches it can accept the patch.
2. Confirm it is not reachable from anything we ship to a browser.
3. Add the GHSA id to `allow-ghsas` in `.github/workflows/dependency-review.yml`, with a comment
   naming the package and why it is accepted.
4. Re-check the list at every Docusaurus upgrade and delete entries once a patch ships. The
   allowlist is meant to shrink.

Do not raise `fail-on-severity` to work around a single advisory — that silently accepts every
future one at that level too.

## Keeping the tree fresh

`.github/dependabot.yml` runs weekly with grouped updates and a cooldown window (5 days by default,
30 for majors). The cooldown is deliberate: it gives the ecosystem time to catch a compromised
release before we pull it in. Security updates bypass it.

A stale lockfile is itself a security problem. In November 2025 this repo accumulated 71 advisories,
and almost every one was a transitive dependency whose patched version was **already inside the
declared semver range** — they were simply never re-resolved. Regenerating the lockfile cleared 68
of them.

## A note on `resolutions`

Yarn Classic `resolutions` are unscoped: an entry for `foo` collapses _every_ requested range for
`foo` into a single version across the whole tree. An entry like `"js-yaml": "^3.14.2"` will happily
downgrade a package that asked for `^4.1.0`. This repo hit exactly that, and the resolutions block
ended up creating advisories rather than fixing them.

If you must add one, scope it (`**/pkg@^1`) and pin an exact minimum, never an open-ended `>=`,
which `--frozen-lockfile` will freeze at whatever satisfied it on the day it was added.
