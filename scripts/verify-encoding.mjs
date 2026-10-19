/**
 * Reject source text that was decoded as Windows-1252 and saved as UTF-8.
 *
 *   npm run verify:encoding
 *
 * WHY THIS EXISTS
 * ---------------
 * One misplaced encoding turns one character into three that look like noise:
 * an em dash arrived as U+00E2 U+20AC U+201D on the careers page and an arrow
 * as U+00E2 U+2020 U+2019 on the gallery cards, and both shipped. The bytes are
 * valid UTF-8 and the markup is valid HTML, so nothing else in the gate notices;
 * the build stays green and the page reads "View system detail" followed by
 * three glyphs nobody can name. A diff shows the run as a smudge rather than as
 * a wrong character, and the page's author, who knows what the sentence means,
 * reads it as the sentence and moves on.
 *
 * HOW IT IS DETECTED
 * ------------------
 * A round trip. If every character in a run of non-ASCII text maps onto a
 * Windows-1252 byte, and those bytes decode as valid UTF-8, then the run is a
 * character that was mis-read once: the em dash above is really the bytes
 * E2 80 94, which are the em dash. Deliberate punctuation cannot survive the
 * same trip - a middle dot is the byte B7, and B7 alone is not a valid UTF-8
 * sequence - so the guard separates corruption from an accented letter or a
 * middle dot rather than banning non-ASCII text.
 *
 * That is also why this file contains no example of the corruption to copy:
 * the guard would flag it, correctly, and a written-out example is a fixture
 * that can drift from the real thing. The fixtures build the damage from the
 * character it hides, and the comments name code points.
 *
 * The detector is checked against known answers before it is trusted, since a
 * guard that has quietly stopped recognising its pattern is worse than no
 * guard: it reports a pass.
 *
 * SCOPE
 * -----
 * First-party source, so .git, build output, image masters and the vendored
 * .opencode/skills data are skipped. The vendored data is third-party and
 * contains this exact corruption in its licence strings.
 */
import fs from 'node:fs'
import path from 'node:path'
import { failures, pad, finish } from './lib/verify.mjs'

const ROOT = process.cwd()

/** Not first-party source: tooling, build output, or binary asset masters. */
const SKIP = new Set(['node_modules', 'dist', 'dist-ssr', 'assets-src', 'build', 'out'])

const TEXT = new Set([
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.html',
  '.json',
  '.svg',
  '.txt',
  '.md',
  '.xml',
  '.yml',
  '.yaml',
  '.webmanifest',
])

/**
 * Windows-1252 byte for every character it can produce, the inverse of the
 * mis-reading this guard detects. Built from the decoder so the table matches
 * the platform's idea of the encoding rather than a hand-typed array.
 */
const decoder1252 = new TextDecoder('windows-1252')
const TO_1252 = new Map()
for (let byte = 0x80; byte <= 0xff; byte++) {
  const char = decoder1252.decode(Uint8Array.of(byte))
  if (!TO_1252.has(char)) TO_1252.set(char, byte)
}

const utf8 = new TextDecoder('utf-8', { fatal: true })

/**
 * The damage done to one character, produced rather than typed: the character's
 * UTF-8 bytes read back as Windows-1252. This is the failure being hunted, so a
 * fixture made with it cannot disagree with the thing it is testing.
 */
const damaged = (char) => decoder1252.decode(Buffer.from(char, 'utf8'))

/**
 * The character a run of text is hiding, or null when the run is honest.
 *
 * Null means "not this kind of damage", not "ASCII": a middle dot, an em dash
 * and an accented letter all return null because no byte sequence explains
 * them, and that is the point.
 */
function doubleDecoded(run) {
  const bytes = []
  for (const char of run) {
    const byte = TO_1252.get(char)
    if (byte === undefined) return null
    bytes.push(byte)
  }
  try {
    const recovered = utf8.decode(Uint8Array.from(bytes))
    return recovered === run ? null : recovered
  } catch {
    return null
  }
}

// Known answers: [text, what it hides or null when it hides nothing].
const FIXTURES = [
  [damaged('\u2014'), '\u2014'], // the em dash from the careers page
  [damaged('\u2192'), '\u2192'], // the arrow from the gallery cards
  [damaged('\u00b7'), '\u00b7'], // a middle dot
  [damaged('\u2019'), '\u2019'], // a curly apostrophe
  ['\u00b7', null], // ·  as the file means it
  ['\u2014', null], // —
  ['\u2019', null], // ’
  ['\u201c', null], // “
  ['\u00e9', null], // é  - an accented letter is not corruption
  ['\u00d7', null], // ×
  ['\u00b0', null], // °
  ['ALNADA', null], // ASCII
]

for (const [text, expected] of FIXTURES) {
  const got = doubleDecoded(text)
  if (got !== expected) {
    failures.push(
      `self-test: doubleDecoded(${JSON.stringify(text)}) gave ${JSON.stringify(got)}, ` +
        `expected ${JSON.stringify(expected)}. The detector is broken; fix it before ` +
        'trusting the result below.'
    )
  }
}

const files = []
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    if (entry.isDirectory()) {
      if (!SKIP.has(entry.name)) walk(path.join(dir, entry.name))
    } else if (TEXT.has(path.extname(entry.name).toLowerCase())) {
      files.push(path.join(dir, entry.name))
    }
  }
}
walk(ROOT)

const rows = []
let runs = 0

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8')
  const relative = path.relative(ROOT, file).replace(/\\/g, '/')
  for (const match of text.matchAll(/[^\x00-\x7f]+/g)) {
    runs++
    const hidden = doubleDecoded(match[0])
    if (!hidden) continue
    const line = text.slice(0, match.index).split('\n').length
    rows.push({ relative, line, found: match[0], hidden })
    failures.push(
      `${relative}:${line} holds "${match[0]}" where "${hidden}" is meant - the file was ` +
        'read as Windows-1252 and written back as UTF-8'
    )
  }
}

if (rows.length) {
  console.log(`${pad('file', 40)}${pad('line', 6)}${pad('in the file', 14)}should be`)
  for (const row of rows) {
    console.log(
      `${pad(row.relative, 40)}${pad(row.line, 6)}${pad(JSON.stringify(row.found), 14)}${row.hidden}`
    )
  }
  console.log('')
}

finish(`${files.length} source files carry ${runs} runs of non-ASCII text, all of them meant`)
