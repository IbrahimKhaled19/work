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
 *   node scripts/serve-dist.mjs [port]
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'

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

const server = http.createServer((req, res) => {
  const found = resolveFile(req.url || '/')

  if (found) {
    const body = fs.readFileSync(found.file)
    res.writeHead(found.status, {
      'Content-Type': contentType(found.file),
      'Content-Length': body.length,
      // Hashed asset filenames are safe to cache forever.
      'Cache-Control': found.file.includes(`${path.sep}assets${path.sep}`)
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=0, must-revalidate',
    })
    res.end(body)
    return
  }

  // No match: serve 404.html with a real 404 status.
  const notFound = path.join(ROOT, '404.html')
  if (fs.existsSync(notFound)) {
    const body = fs.readFileSync(notFound)
    res.writeHead(404, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Length': body.length,
    })
    res.end(body)
    return
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('404')
})

server.listen(PORT, () => {
  console.log(`serving dist/ at http://localhost:${PORT}`)
  console.log('(directory-index resolution + real 404s, like static hosting)')
})
