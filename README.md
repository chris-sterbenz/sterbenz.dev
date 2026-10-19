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
- `public/chris-sterbenz-resume.pdf` — valid, clearly marked placeholder PDF. Replace with the final résumé at the same path.
- `public/favicon.svg` — typographic favicon.

The biography and experience descriptions are intentionally placeholders. Chapter headings and subject tags are also provisional. LinkedIn and GitHub link to the real profiles.

The design uses a warm paper background, charcoal text, olive accents, serif display type, and thin rules. Native fragment links scroll directly to each section without motion.

Deployment configuration and instructions arrive in the separate GitOps pull request.
