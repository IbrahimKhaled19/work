/**
 * Save the pristine client-build HTML as the prerender template.
 *
 * `vite build` empties dist/ on every run, so dist/index.html is only the raw
 * Vite output for the first prerender after a client build. Re-running
 * `build:prerender` alone would otherwise use the already-prerendered file as
 * its own template, and every run would append another copy of the head block
 * and of the preload links React 19 generates for eager images.
 *
 * Copying the template out of dist/ makes the prerender deterministic and
 * idempotent regardless of how many times it runs.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const TEMPLATE_DIR = path.join(ROOT, '.cache')
const TEMPLATE = path.join(TEMPLATE_DIR, 'prerender-template.html')
const SOURCE = path.join(ROOT, 'dist', 'index.html')

if (!fs.existsSync(SOURCE)) {
  console.error('  dist/index.html not found - run the client build first.')
  process.exit(1)
}

fs.mkdirSync(TEMPLATE_DIR, { recursive: true })
fs.copyFileSync(SOURCE, TEMPLATE)
console.log(`prerender template saved (.cache/prerender-template.html)`)
