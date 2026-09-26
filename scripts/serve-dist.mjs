/**
 * Minimal static server for dist/, matching how real static hosting resolves
 * prerendered sites.
 *
 * Why this exists: `vite preview` applies an SPA fallback, so it serves
 * dist/index.html for every unmatched path. That silently defeats
 * prerendering - /about would return the homepage, and every route would
 * carry the homepage's title and canonical. It is the single most important
 * thing to get right when deploying a prerendered SPA, and it is invisible
 * until you check.
 *
 * This server does what a static host does:
 *   /about          -> dist/about/index.html
 *   /about/         -> dist/about/index.html
 *   /               -> dist/index.html
 *   /anything-else  -> dist/404.html, with HTTP 404
 *
 * It also gzips text responses, because every real static host does. Without
 * that, an audit measures ~360 KiB of uncompressed text crossing the wire and
 * reports a `uses-text-compression` failure that belongs to the test harness
 * rather than to the site - and, worse, inflates FCP and LCP by enough to
 * change which optimisation looks like the priority. Measuring against an
 * uncompressed server means measuring against a server nobody deploys to.
 *
 *   node scripts/serve-dist.mjs [port]
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'

const ROOT = path.join(process.cwd(), 'dist')
const PORT = Number(process.argv[2] || 4174)

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
}

function contentType(file) {
  return TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream'
}

/** Text types worth compressing. Images are already compressed. */
const COMPRESSIBLE = /^(text\/|application\/(javascript|json|xml|manifest\+json)|image\/svg)/

const COMPRESS_MIN_BYTES = 1024

/** Resolve a URL path to a file inside dist/, or null. */
function resolveFile(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0])
  // Block traversal above dist/.
  const normalised = path.normalize(decoded).replace(/^(\.\.[/\\])+/, '')
  const candidate = path.join(ROOT, normalised)

  if (!candidate.startsWith(ROOT)) return null

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return { file: candidate, status: 200 }
  }
  // Directory: serve its index.html, exactly as static hosting does.
  const index = path.join(candidate, 'index.html')
  if (fs.existsSync(index) && fs.statSync(index).isFile()) {
    return { file: index, status: 200 }
  }
  return null
}

/**
 * Write a file's bytes, gzipped when the client asked for it and the content
 * is compressible. Mirrors what a real static host does, so audit numbers
 * reflect a deployable configuration rather than this script's defaults.
 */
function send(req, res, file, status) {
  const body = fs.readFileSync(file)
  const type = contentType(file)

  const headers = {
    'Content-Type': type,
    // Hashed asset filenames are safe to cache forever.
    'Cache-Control': file.includes(`${path.sep}assets${path.sep}`)
      ? 'public, max-age=31536000, immutable'
      : 'public, max-age=0, must-revalidate',
  }

  const acceptsGzip = /\bgzip\b/.test(req.headers['accept-encoding'] || '')
  const shouldCompress = acceptsGzip && COMPRESSIBLE.test(type) && body.length >= COMPRESS_MIN_BYTES

  if (!shouldCompress) {
    res.writeHead(status, { ...headers, 'Content-Length': body.length })
    res.end(body)
    return
  }

  const gzipped = zlib.gzipSync(body, { level: 9 })
  res.writeHead(status, {
    ...headers,
    'Content-Encoding': 'gzip',
    // Length must describe the encoded bytes, not the decoded ones.
    'Content-Length': gzipped.length,
    Vary: 'Accept-Encoding',
  })
  res.end(gzipped)
}

const server = http.createServer((req, res) => {
  const found = resolveFile(req.url || '/')

  if (found) {
    send(req, res, found.file, found.status)
    return
  }

  // No match: serve 404.html with a real 404 status.
  const notFound = path.join(ROOT, '404.html')
  if (fs.existsSync(notFound)) {
    send(req, res, notFound, 404)
    return
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('404')
})

server.listen(PORT, () => {
  console.log(`serving dist/ at http://localhost:${PORT}`)
  console.log('(directory-index resolution + real 404s, like static hosting)')
})
