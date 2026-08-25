# Contributing to node-ncentral

Thanks for your interest in contributing!

## Getting started

```bash
git clone https://github.com/WYRE-AI/node-ncentral.git
cd node-ncentral
npm install
```

## Development workflow

```bash
npm run lint      # type-check (tsc --noEmit)
npm run build     # dual CJS+ESM build via tsup
npm test          # vitest + MSW mock server
npm run test:watch
```

## Guidelines

- **Zero runtime dependencies.** The client uses native `fetch` only; do not
  add axios, got, node-fetch or similar.
- **Verify endpoint paths against the official API reference.** Every
  endpoint page at `https://developer.n-able.com/n-central/reference/<slug>`
  embeds the full OpenAPI definition — use the exact paths and schemas from
  there, never guessed ones.
- **Read error bodies safely.** Always `await response.text()` once, then
  `JSON.parse` — never call `response.json()` first (the body can only be
  consumed once).
- **Tests are required.** Every public method must be exercised by at least
  one MSW-backed test. Add fixtures shaped from the OpenAPI response schemas
  in `tests/fixtures/`.
- **Type names follow the API's model names** (e.g. `DeviceAssetInfoResponse`,
  `AssetLifecycleDetails`).

## Commit messages

This repository uses [Conventional Commits](https://www.conventionalcommits.org/)
and [semantic-release](https://semantic-release.gitbook.io/). Your commit type
determines the released version:

- `fix:` → patch release
- `feat:` → minor release
- `feat!:` / `BREAKING CHANGE:` → major release
- `docs:`, `test:`, `chore:`, `ci:` → no release

## Pull requests

1. Fork and create a feature branch.
2. Make your changes with tests.
3. Ensure `npm run lint && npm run build && npm test` all pass.
4. Open a PR against `main` with a clear description.

## Releases

Merges to `main` are released automatically by semantic-release to GitHub
Packages. Do not bump versions or edit the generated CHANGELOG entries by
hand.
