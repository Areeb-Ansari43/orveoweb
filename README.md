# Orveo Web

Website for Orveo Web: web design, SEO and GEO for local businesses in London and Luton.

Plain static site: `index.html`, `assets/`, `404.html`, `sitemap.xml`, `robots.txt`, `_headers`. No build step.

## Deploy on Cloudflare Pages
Workers & Pages → Create → Pages → Connect to Git → pick this repo.
- Framework preset: None
- Build command: (leave empty)
- Build output directory: `/`

## Before launch
- Set your real contact email in `index.html` (`data-email="hello@orveo-web.example"` on the form).
- If you use a custom domain, replace `https://orveo-web.pages.dev` in `index.html`, `sitemap.xml` and `robots.txt`.
