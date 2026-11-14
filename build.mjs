#!/usr/bin/env node
// Tiny static builder: src/pages/*.html + src/partials -> dist/. No dependencies.
import { readFileSync, writeFileSync, readdirSync, rmSync, mkdirSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const SITE = 'https://orveo-web.pages.dev';
const out = join(root, 'dist');
const partials = Object.fromEntries(readdirSync(join(root, 'src/partials')).map(f => [f.replace('.html', ''), readFileSync(join(root, 'src/partials', f), 'utf8')]));

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(root, 'assets'), join(out, 'assets'), { recursive: true });
cpSync(join(root, 'src/_headers'), join(out, '_headers'));

const urls = [];
for (const f of readdirSync(join(root, 'src/pages'))) {
  let src = readFileSync(join(root, 'src/pages', f), 'utf8');
  const m = src.match(/^<!--meta\s*([\s\S]*?)-->\s*/);
  if (!m) { writeFileSync(join(out, f), src); continue; }
  const meta = JSON.parse(m[1]);
  const path = f === 'index.html' ? '/' : '/' + f;
  const ctx = { ...meta, canonical: SITE + path, site: SITE, year: new Date().getFullYear(), body: src.slice(m[0].length) };
  let html = partials.layout;
  for (let i = 0; i < 3; i++) html = html.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, n) => partials[n]).replace(/\{\{\s*(\w+)\s*\}\}/g, (s, k) => ctx[k] ?? s);
  html = html.replace(/data-nav="(\w+)"/g, (s, n) => n === meta.nav ? s + ' aria-current="page"' : s);
  writeFileSync(join(out, f), html);
  if (!meta.noindex) urls.push(SITE + path);
}
writeFileSync(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`Built ${urls.length} pages -> dist/`);
