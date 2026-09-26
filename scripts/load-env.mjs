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
 * This is not a hypothetical: it is what happened the first time .env.production
 * was committed.
 *
 * PRECEDENCE
 * ----------
 * An already-set variable wins. That is what lets a CI job or a Vercel
 * environment variable override the committed file without editing it, which is
 * the documented behaviour of Vite's own dotenv handling and the behaviour
 * people expect.
 *
 * MODE ORDER mirrors Vite: .env, then .env.local, then .env.<mode>, then
 * .env.<mode>.local, with later files winning. `NODE_ENV=production` is the
 * default mode because every one of these scripts is a production build step.
 *
 * Deliberately no dependency. Node 20.6+ has `process.loadEnvFile`, but this
 * runs on Node 18 in some environments and a 30-line parser is cheaper than
 * version-gating the build.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const MODE = process.env.NODE_ENV || 'production'

/**
 * Parse one dotenv file. Handles the subset that matters here:
 *   KEY=value
 *   KEY="quoted value"      quotes stripped, \n and \" unescaped
 *   KEY='literal value'     no expansion
 *   # comment               whole-line and trailing
 *   export KEY=value        tolerated
 */
function parse(contents) {
  const out = {}
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const eq = line.indexOf('=')
    if (eq === -1) continue

    const key = line.slice(0, eq).trim().replace(/^export\s+/, '')
    if (!key) continue

    let value = line.slice(eq + 1).trim()

    if (value.startsWith('"') && value.endsWith('"') && value.length > 1) {
      value = value.slice(1, -1).replace(/\\n/g, '\n').replace(/\\"/g, '"')
    } else if (value.startsWith("'") && value.endsWith("'") && value.length > 1) {
      value = value.slice(1, -1)
    } else {
      // Strip a trailing comment from an unquoted value.
      const hash = value.indexOf(' #')
      if (hash !== -1) value = value.slice(0, hash).trim()
    }

    out[key] = value
  }
  return out
}

// Later files win, matching Vite. Missing files are skipped silently.
const files = ['.env', '.env.local', `.env.${MODE}`, `.env.${MODE}.local`]

for (const file of files) {
  const full = path.join(ROOT, file)
  if (!fs.existsSync(full)) continue

  const parsed = parse(fs.readFileSync(full, 'utf8'))
  for (const [key, value] of Object.entries(parsed)) {
    // Never clobber a variable that is already set: a real environment
    // variable must beat the file, or there would be no way to override the
    // committed origin without editing it.
    if (process.env[key] === undefined) process.env[key] = value
  }
}
