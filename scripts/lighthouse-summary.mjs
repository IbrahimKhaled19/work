/**
 * Summarise a Lighthouse JSON report: category scores plus the metrics and
 * the individual audit failures that actually explain the score.
 *
 *   node scripts/lighthouse-summary.mjs <report.json>
 */
import fs from 'node:fs'

const file = process.argv[2]
const report = JSON.parse(fs.readFileSync(file, 'utf8'))

const pad = (v, n) => String(v).padEnd(n)
const lpad = (v, n) => String(v).padStart(n)

console.log(`\n${report.finalDisplayedUrl || report.finalUrl}`)
console.log(`Lighthouse ${report.lighthouseVersion}  ·  ${report.fetchTime}\n`)
console.log('='.repeat(72))

// --- category scores ------------------------------------------------------
console.log('\nCATEGORY SCORES')
for (const [id, cat] of Object.entries(report.categories)) {
  const score = cat.score === null ? 'n/a' : Math.round(cat.score * 100)
  const bar = cat.score === null ? '' : '█'.repeat(Math.round(cat.score * 20)).padEnd(20, '·')
  console.log(`  ${pad(id, 16)} ${lpad(score, 4)}  ${bar}`)
}

// --- core metrics ---------------------------------------------------------
const METRICS = [
  ['first-contentful-paint', 'FCP', 'ms'],
  ['largest-contentful-paint', 'LCP', 'ms'],
  ['total-blocking-time', 'TBT', 'ms'],
  ['cumulative-layout-shift', 'CLS', ''],
  ['speed-index', 'Speed Index', 'ms'],
]
console.log('\nCORE WEB VITALS / METRICS (simulated mobile throttling)')
console.log(`  ${pad('metric', 16)}${lpad('value', 12)}${lpad('rating', 22)}score`)
for (const [id, label] of METRICS) {
  const audit = report.audits[id]
  if (!audit) continue
  const display = audit.displayValue || (typeof audit.numericValue === 'number' ? audit.numericValue.toFixed(2) : '-')
  const score = audit.score === null ? 'n/a' : Math.round(audit.score * 100)
  console.log(`  ${pad(label, 16)}${lpad(display, 12)}${lpad('', 22)}${score}`)
}

// --- what failed ----------------------------------------------------------
for (const [id, cat] of Object.entries(report.categories)) {
  const failed = cat.auditRefs
    .map((ref) => report.audits[ref.id])
    .filter((a) => a && a.score !== null && a.score < 1)
  if (!failed.length) continue
  console.log(`\n${id.toUpperCase()} - ${failed.length} audit(s) below full marks`)
  for (const audit of failed) {
    const score = audit.score === null ? 'n/a' : Math.round(audit.score * 100)
    console.log(`  [${lpad(score, 3)}] ${pad(audit.id, 34)} ${audit.title}`)
    if (audit.displayValue) console.log(`         ${audit.displayValue}`)
  }
}

console.log('')
