# Deployment

## Design

Astro builds static HTML and CSS. Cloudflare Workers Static Assets serves `dist/`; there is no application Worker script or server adapter.

`wrangler.jsonc` owns the Worker, assets, account selection, and custom domain. GitHub Actions owns validation and production releases. This is push-based GitOps: a merge to `main` reconciles the checked-in configuration. It does not continuously detect dashboard drift.

Production uses `sterbenz-dev` at `https://sterbenz.dev`. Its `workers.dev` and version preview URLs are disabled. The optional preview environment uses a separate `sterbenz-dev-preview` Worker, with no production domain routes.

The site uses the existing Cloudflare account `910226764400d7d81440a4bed72cb8e8`. The `sterbenz.dev` zone was confirmed active on 2026-10-19. No existing Workers or custom domains were present. Public DNS had no apex web address. The Wrangler OAuth session cannot read DNS records through the API; this is a permission boundary, not proof that every record is absent.

## One-time setup

1. Merge website PR #1 first. The deployment PR is stacked on its branch; retarget it to `main` after merging #1.
2. Apply the checked-in GitHub settings with `bash scripts/bootstrap-github.sh`. This creates the `production` environment and protects `main`. The environment and its main-only policy were bootstrapped before merging; branch protection must wait until website PR #1 has merged.
3. Open Cloudflare's [Account API tokens](https://dash.cloudflare.com/?to=/:account/api-tokens). Create a token named `sterbenz-dev-github-actions` using **Edit Cloudflare Workers**. Limit it to this account and the `sterbenz.dev` zone. This site needs Workers creation/deployment, custom-domain management, and zone discovery. Keep those permissions from the template; remove unrelated storage/product grants. With the newer role interface, Workers creation needs Workers Admin; custom domains do not yet support per-Worker roles. Use Cloudflare's current template as the baseline.
4. Save the token directly in GitHub: **Settings → Environments → production → Environment secrets → Add environment secret**. Name it `CLOUDFLARE_API_TOKEN`. Never put it in chat, code, a PR, or a shell argument. Account ID is public configuration and is already in Wrangler.
5. Merge the deployment PR. The push to `main` starts validation and deployment. No separate Cloudflare GitHub app or Workers Builds connection is needed.
6. Watch **Actions → Website**. A successful run proves the expected commit is served over HTTPS, the PDF works, security headers exist, and unknown paths return 404.

Cloudflare provisions DNS and TLS for the configured custom domain during deployment. Do not add a separate Pages project or manually create an apex CNAME. If Cloudflare reports an existing DNS record conflict, inspect it before changing anything.

Only the apex `sterbenz.dev` is configured. `www` redirects are deferred. The deployment does not touch email records, nameservers, zone-wide redirects, or other DNS settings.

## Release path

1. Open a PR for content or configuration changes.
2. Validation checks formatting, Astro types, the static build, desktop/mobile browser behavior, accessibility, and Wrangler packaging. PRs receive no Cloudflare secret and never deploy.
3. Merge after **Validate website** passes. `main` requires PRs and that check, including for administrators.
4. The workflow uploads the validated `dist/` artifact and deploys that exact artifact from a separate production job. It does not rebuild the site before upload to Cloudflare.
5. The workflow checks `/_build.json` against the commit SHA. A failed check makes the run fail visibly. It does not automatically roll back.

A manual **Run workflow** on `main` can reconcile dashboard drift or retry a transient release failure. Other branches cannot deploy production. GitHub environment policy independently allows only the `main` branch.

A missing token fails explicitly. There is no local-login fallback in CI. Keep the token in the production environment and rotate it there when it expires.

## Preview and local verification

```sh
npm ci
npm run check
npm run build
npm test
npm run deploy:check
```

`deploy:check` packages the site without a remote write. Browser tests require `npx playwright install chromium` first.

For an optional first-deploy smoke test, use the authenticated local Wrangler session on the pushed deployment branch:

```sh
node scripts/stamp-build.mjs
npm run deploy:preview
node scripts/verify-deployment.mjs https://RETURNED-PREVIEW-HOST COMMIT_SHA
```

This writes only the separate preview Worker. The preview URL is public and serves the same placeholder content. Production remains managed by Actions. Preview deployment is manual until a separate workflow is needed; it does not run for untrusted PRs.

## Rollback

Revert the faulty merge through a PR and merge the revert. Actions deploys the reverted content as a new commit and verifies it. For urgent recovery, redeploy a known-good Worker version in Cloudflare, then immediately reconcile through a revert PR. This static site has no persistent data or database migrations.

## Source ownership and deferred work

- `wrangler.jsonc` — production and isolated preview configuration.
- `.github/workflows/website.yml` — checks, immutable build artifact, deployment, and post-deploy verification.
- `.github/settings/` — branch protection and production environment policy. Reapply with `scripts/bootstrap-github.sh` after changing them.
- GitHub environment secrets — API token. Secrets are intentionally outside Git.
- Cloudflare account/zone — existing user-owned resources, not imported into Terraform.

Terraform would add state and credentials without helping this single static Worker. Add it if zone-wide DNS, redirects, or more Cloudflare resources need repository ownership. A CMS, analytics, a blog, automatic PR previews, `www` redirection, and scheduled drift checks are deferred.

## References

- [Static Assets](https://developers.cloudflare.com/workers/static-assets/)
- [Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [GitHub Actions authentication](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)
- [Workers roles and permissions](https://developers.cloudflare.com/workers/authorization/workers/)
- [Official Cloudflare agent setup](https://developers.cloudflare.com/agent-setup/prompt.md)
