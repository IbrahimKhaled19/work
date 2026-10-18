/**
 * Load .env files into process.env for the plain-Node build scripts.
 *
 *   import './load-env.mjs'   - before anything that reads site.js
 *
 * WHY THIS IS NEEDED
 * ------------------
 * `npm run build` is four steps. Two of them run Vite, which loads
 * .env.production itself:
 *
 *   build:client     vite build         env loaded
 *   build:ssr        vite build --ssr   env loaded
 *   build:prerender  node scripts/...   NOT loaded   <-- writes the canonicals
 *   build:crawl      node scripts/...   NOT loaded   <-- writes the sitemap
 *
 * The prerender is the step that bakes <link rel="canonical">, og:url and the
 * JSON-LD @id values into every static page, and crawl.mjs writes sitemap.xml.
 * Both read VITE_SITE_URL through src/seo/site.js, which falls back to
 * `globalThis.process.env`. Plain node does not read .env files, so a committed
 * .env.production was silently ignored by exactly the two steps that most
 * depend on it, and the build died with "VITE_SITE_URL is not set" even though
 * the file was sitting in the project root.
 *
 * PRECEDENCE
 * ----------
 * Handled by the runtime, and the same rules Vite uses: a variable already in
 * the environment wins over the file, and the files are read in mode order with
 * later files winning. Node's own --env-file semantics already do both, which
 * is why this is a loop and not a parser - this file used to carry a
 * hand-rolled dotenv reader with its own copy of those rules to keep in step.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const MODE = process.env.NODE_ENV || 'production'

if (typeof process.loadEnvFile !== 'function') {
  throw new Error(
    'process.loadEnvFile() is unavailable on this Node version. package.json requires ' +
      'node ^20.19.0 || >=22.12.0, where it exists (added in 20.12.0).'
  )
}

// Mode order mirrors Vite: .env, then .env.local, then .env.<mode>, then
// .env.<mode>.local, with later files winning. Missing files are skipped.
for (const file of ['.env', '.env.local', `.env.${MODE}`, `.env.${MODE}.local`]) {
  const full = path.join(ROOT, file)
  if (fs.existsSync(full)) process.loadEnvFile(full)
}