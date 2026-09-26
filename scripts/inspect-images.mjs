/**
 * Image inspection pass. Prints intrinsic dimensions, format and alpha for
 * every image in public/ so the optimisation pipeline can be designed against
 * real numbers rather than guesses.
 *
 *   node scripts/inspect-images.mjs
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const PUBLIC = path.join(ROOT, 'public')
const EXT = /\.(png|jpe?g|webp|avif|svg)$/i

function walk(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (EXT.test(entry.name)) out.push(full)
  }
  return out
}

const files = walk(PUBLIC).sort()
const rows = []
let totalBytes = 0

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/')
  const bytes = fs.statSync(file).size
  totalBytes += bytes

  if (/\.svg$/i.test(file)) {
    const source = fs.readFileSync(file, 'utf8')
    const viewBox = source.match(/viewBox=["']([^"']+)["']/)?.[1]
    const width = source.match(/\bwidth=["']([^"']+)["']/)?.[1]
    const height = source.match(/\bheight=["']([^"']+)["']/)?.[1]
    rows.push({
      rel,
      kb: bytes / 1024,
      format: 'SVG',
      width,
      height,
      note: viewBox ? `viewBox ${viewBox}` : 'no viewBox',
    })
    continue
  }

  try {
    const meta = await sharp(file).metadata()
    rows.push({
      rel,
      kb: bytes / 1024,
      format: meta.format,
      width: meta.width,
      height: meta.height,
      note: [
        meta.hasAlpha ? 'alpha' : 'opaque',
        meta.isProgressive ? 'progressive' : null,
        meta.space === 'srgb' ? null : meta.space,
      ]
        .filter(Boolean)
        .join(', '),
    })
  } catch (error) {
    rows.push({ rel, kb: bytes / 1024, format: 'ERR', width: null, height: null, note: error.message })
  }
}

const pad = (value, width) => String(value).padStart(width)
const lpad = (value, width) => String(value).padEnd(width)

console.log('\n' + lpad('file', 36) + pad('KB', 8) + '  ' + lpad('fmt', 6) + pad('WxH', 13) + '  notes')
console.log('-'.repeat(84))
for (const r of rows) {
  const dims = r.width && r.height ? `${r.width}x${r.height}` : '-'
  console.log(lpad(r.rel, 36) + pad(r.kb.toFixed(0), 8) + '  ' + lpad(r.format, 6) + pad(dims, 13) + '  ' + r.note)
}
console.log('-'.repeat(84))
console.log(lpad(`${rows.length} images`, 36) + pad((totalBytes / 1024).toFixed(0), 8) + ' KB total\n')
