# sterbenz.dev

A single-page personal website for Chris Sterbenz. Built with Astro, semantic HTML, and plain CSS. No client JavaScript, web fonts, animations, analytics, or runtime server.

## Development

Use Node 22.12 or later (`nvm use`).

```sh
npm ci
npm run dev
```

## Checks

```sh
npm run check
npm run build
npx playwright install chromium
npm test
```

The browser checks cover desktop and mobile accessibility, fragment navigation, layout overflow, keyboard access, and the PDF download.

## Content

- `src/pages/index.astro` — biography, links, and experience entries.
- `src/styles/global.css` — layout, responsive styles, and print styles.
- `public/headshot.jpg` — local copy of Chris's public GitHub profile photo.
- `public/chris-sterbenz-resume.pdf` — the supplied October 22, 2026 résumé, served at a stable download URL.
- `public/favicon.svg` — typographic favicon.

The biography, experience, and education summarize the October 22, 2026 résumé. Update the page and PDF together when the résumé changes. LinkedIn and GitHub link to the real profiles.

The design uses a warm paper background, charcoal text, olive accents, serif display type, and thin rules. Native fragment links scroll directly to each section without motion.

## Deployment

Cloudflare Workers Static Assets serves the site. GitHub Actions validates PRs and deploys merges to `main`. Configuration lives in `wrangler.jsonc`.

See [the deployment runbook](docs/deployment.md) for one-time token setup, release checks, previews, and rollback.
