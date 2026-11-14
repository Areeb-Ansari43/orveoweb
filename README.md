# Orveo Web

Website for Orveo Web: web design, SEO and GEO for local businesses in London and Luton.

Five pages, each with its own Apple-style scroll animation: Home (laptop zoom, outdated-to-outstanding wipe, sideways feature scroll), Work (client websites scroll inside a laptop and phone), Pricing (stacking plan cards, Google ranking climb), About (orbiting logo, word-by-word statement, timeline) and Contact (steps that light up). Visitors who turn on reduced motion get a static version.

## Edit and build
Pages live in `src/pages`, shared header/footer in `src/partials`, styles and scripts in `assets/`.

```bash
node build.mjs
```

This writes the finished site to `dist/`. No dependencies needed.

## Deploy on Cloudflare Pages
Workers & Pages → Create → Pages → Connect to Git → pick this repo.
- Framework preset: None
- Build command: `node build.mjs`
- Build output directory: `dist`

## Before launch
- Set your real contact email in `src/pages/contact.html` (`data-email="hello@orveo-web.example"`).
- If you use a custom domain, change `SITE` in `build.mjs` and the URLs in `src/partials/schema.html`.
