/**
 * Shared plumbing for the verify-* scripts.
 *
 * All twelve kept their own copy of the same things: an array to collect
 * failures, a one-line fail(), a pad() for the tables, and a tail that prints
 * every failure and exits 1 - or prints a PASSED line. The copies were not
 * quite identical - banners at width 60, 64, 76 and 78, and two scripts
 * deduplicating the list while four printed duplicates - so changing how
 * failures are reported meant editing twelve files, and a thirteenth script
 * copy-pasted from the twelfth would inherit whichever variant was to hand.
 *
 * What moves here is only the plumbing. What each script checks stays in it:
 * `failures.push(...)` at the point of detection reads better than a round
 * trip through a helper, and the checks are the part that legitimately
 * differs between scripts.
 *
 * `failures` is module state, which is safe because every verifier is its own
 * process and imports nothing else that collects into it.
 *
 * Everything below is called once per run, at the end of the script.
 */
import fs from 'node:fs'
import path from 'node:path'

/** Every failure recorded since the process started, in the order found. */
export const failures = []

/** Record one already-formatted failure. */
export const fail = (message) => failures.push(message)

/** Left-align a value in a fixed-width table column. */
export const pad = (value, width) => String(value).padEnd(width)

/**
 * Every .html file under dir, recursively, as absolute paths.
 * readdirSync order, so the result is stable within a run.
 */
export function htmlFiles(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) htmlFiles(p, out)
    else if (name.endsWith('.html')) out.push(p)
  }
  return out
}

/**
 * Print the verdict and exit non-zero on failure.
 *
 * `passedMessage` is the text after "PASSED - ". The failures are
 * deduplicated because one defect is usually found once per page, and twelve
 * copies of a sentence say nothing the first did not.
 */
export function finish(passedMessage) {
  if (failures.length) {
    const unique = [...new Set(failures)]
    console.log(`\n${'x'.repeat(64)}\nFAILED (${unique.length})`)
    for (const message of unique) console.log(`  - ${message}`)
    console.log('')
    process.exit(1)
  }
  console.log(`\n${'='.repeat(64)}\nPASSED - ${passedMessage}\n`)
}
