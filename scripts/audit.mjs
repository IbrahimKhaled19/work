/**
 * One-command Lighthouse audit against the built site.
 *
 *   npm run audit
 *
 * Starts scripts/serve-dist.mjs, runs Lighthouse against it with Chrome's
 * simulated mobile throttling, prints a summary, then shuts the server down.
 *
 * Why a script rather than a documented incantation: the audit is only
 * meaningful against the *prerendered* output served the way a host serves it.
 * Running Lighthouse against `vite dev` measures the wrong thing entirely, and
 * `vite preview` serves the homepage for every route because of its SPA
 * fallback - which would understate SEO while looking fine.
 *
 * Lighthouse is invoked through npx rather than added as a dependency: it is a
 * ~10 MB tree that is only needed when someone runs an audit, and npx caches it
 * so repeat runs are offline.
 */
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const PORT = Number(process.env.AUDIT_PORT || 4180)
const URL_UNDER_TEST = process.env.AUDIT_URL || `http://localhost:${PORT}/`
const OUT = path.join(os.tmpdir(), 'lighthouse-report.json')

// --- preflight -------------------------------------------------------------
if (!fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'))) {
  console.error('dist/ not found. Run `npm run build` first.')
  process.exit(1)
}

const chrome =
  process.env.CHROME_PATH ||
  [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
  ].find((p) => fs.existsSync(p))

if (!chrome) {
  console.error('Chrome not found. Set CHROME_PATH to your Chrome binary.')
  process.exit(1)
}
process.env.CHROME_PATH = chrome

// --- serve -----------------------------------------------------------------
const server = spawn(process.execPath, ['scripts/serve-dist.mjs', String(PORT)], {
  stdio: 'ignore',
})

const cleanup = () => {
  if (!server.killed) server.kill()
}
process.on('exit', cleanup)
process.on('SIGINT', () => {
  cleanup()
  process.exit(130)
})

// Wait for the server to accept connections.
const waitForServer = async () => {
  for (let i = 0; i < 40; i += 1) {
    try {
      const res = await fetch(URL_UNDER_TEST, { method: 'HEAD' })
      if (res.ok || res.status === 404) return true
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  return false
}

if (!(await waitForServer())) {
  console.error(`serve-dist did not come up on port ${PORT}`)
  cleanup()
  process.exit(1)
}

// --- audit -----------------------------------------------------------------
console.log(`\nAuditing ${URL_UNDER_TEST} (simulated mobile throttling)...\n`)

// On Windows, npx is a .cmd shim and Node refuses to spawn one directly
// (EINVAL) unless the shell is used. The chrome-flags value contains spaces, so
// it is quoted for the shell below.
const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx'

const result = spawnSync(
  NPX,
  [
    '--yes',
    'lighthouse@12',
    URL_UNDER_TEST,
    '--output=json',
    `--output-path=${OUT}`,
    '--chrome-flags=--headless=new --no-sandbox',
    '--quiet',
  ],
  { stdio: 'inherit', env: process.env, shell: process.platform === 'win32' }
)
cleanup()

if (result.status !== 0 || !fs.existsSync(OUT)) {
  console.error('\nLighthouse failed to produce a report.')
  if (result.error) console.error(`  ${result.error.message}`)
  else if (result.status) console.error(`  npx exited with status ${result.status}`)
  process.exit(result.status || 1)
}

// --- summarise -------------------------------------------------------------
const summary = spawnSync(process.execPath, ['scripts/lighthouse-summary.mjs', OUT], {
  stdio: 'inherit',
})

process.exit(summary.status || 0)
