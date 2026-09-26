/**
 * Pull the specific elements behind a failing Lighthouse audit.
 *
 *   node scripts/lighthouse-detail.mjs <report.json> [auditId ...]
 *
 * A score of 0 on an a11y or best-practices audit is not actionable on its
 * own. This prints the offending selectors and text so the fix has a target.
 */
import fs from 'node:fs'

const [file, ...wanted] = process.argv.slice(2)
const report = JSON.parse(fs.readFileSync(file, 'utf8'))

const pad = (v, n) => String(v).padEnd(n)
const lpad = (v, n) => String(v).padStart(n)

console.log(`\n${report.finalDisplayedUrl || report.finalUrl}`)
console.log(`Lighthouse ${report.lighthouseVersion}  ·  ${report.fetchTime}\n`)

const audits =
  wanted.length > 0
    ? wanted
    : Object.entries(report.audits)
        .filter(([, a]) => a.score !== null && a.score < 1)
        .map(([id]) => id)

for (const id of audits) {
  const audit = report.audits[id]
  if (!audit) {
    console.log(`  (no audit "${id}" in this report)`)
    continue
  }

  const score = audit.score === null ? 'n/a' : Math.round(audit.score * 100)
  console.log('='.repeat(72))
  console.log(`[${lpad(score, 3)}] ${id}  —  ${audit.title}`)
  if (audit.displayValue) console.log(`        ${audit.displayValue}`)
  if (audit.description) console.log(`        ${audit.description.split('\n')[0]}`)
  if (audit.explanation) console.log(`        ${audit.explanation.split('\n')[0]}`)

  const items = audit.details?.items || []
  if (items.length === 0) {
    console.log('        (no item detail)')
    continue
  }

  const show = (item, label, value) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      console.log(`   ${pad(label, 14)} ${String(value).replace(/\s+/g, ' ').trim().slice(0, 200)}`)
    }
  }

  for (const [i, item] of items.slice(0, 8).entries()) {
    console.log(`   ${lpad(i + 1, 3)}. ${item.node?.selector || item.source?.url || '(no selector)'}`)
    if (item.node?.snippet) {
      console.log(
        `        ${item.node.snippet.replace(/\s+/g, ' ').trim().slice(0, 200)}`
      )
    }
    show(item, 'explanation', item.node?.explanation || item.explanation)
    show(item, 'value', item.value ?? item.size)
    show(item, 'wastedBytes', item.wastedBytes)
    show(item, 'source', typeof item.source === 'string' ? item.source : item.source?.url)
    if (item.url) console.log(`        ${String(item.url).slice(0, 160)}`)
  }
  if (items.length > 8) console.log(`   ... ${items.length - 8} more`)

  // Sub-aggregations carry the per-reason breakdown for several audits.
  for (const [name, group] of Object.entries(audit.details?.headings || {})) {
    const gi = group.items || []
    if (!gi.length) continue
    console.log(`   by ${name}:`)
    for (const row of gi.slice(0, 6)) {
      console.log(
        `        ${pad(row.source?.url || row.subItems?.subItems?.items?.[0]?.url || '?', 46)} ${row.wastedBytes ? `${Math.round(row.wastedBytes / 1024)} KiB` : ''} ${row.subItems?.subItems?.items?.[0]?.totalBytes ? `${Math.round((row.subItems.subItems.items[0].totalBytes) / 1024)} KiB total` : ''}`
      )
    }
  }
}

console.log('')
