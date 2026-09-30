# Report intake

Stateless Worker that receives censored page reports from the extension (`POST /v1/reports`), re-sanitizes them with `@reforma-digital/capture`, and stores them in a **private** GitHub repository. It never holds a token that can write to the public repo.

## Deploy (Cloudflare Worker sketch)

1. Create a private repo `reforma-digital-inbox` (or similar).
2. Create a GitHub App installed only on that private repo (contents + issues).
3. Set Worker secrets: `GITHUB_APP_ID`, `GITHUB_INSTALLATION_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_PRIVATE_REPO`.
4. Optional: bind a KV namespace as `RATE_LIMIT_KV`.
5. Deploy `src/index.ts` as the Worker entry (bundle with the monorepo capture package).
6. Copy [`.github/workflows/report-intake.yml`](../../.github/workflows/report-intake.yml) into the **private** repo and set `PUBLIC_REPO` + `PUBLIC_REPO_TOKEN` (write limited to `sites/*/fixtures/inbox/**` on the public repo).

## Extension build

```sh
BG_INTAKE_ORIGIN=https://intake.example.com npm run build
```

Without `BG_INTAKE_ORIGIN`, the report UI can capture and preview but cannot submit.

## Tests

```sh
npx vitest run apps/intake
```
