/**
 * Validate the JSON-LD against the schema.org vocabulary.
 *
 *   npm run verify:schema
 *
 * WHY THIS IS NOT THE SAME AS verify:seo
 * --------------------------------------
 * verify:seo proves the JSON-LD is well-formed JSON with the expected @context
 * and node types. That is necessary and nowhere near sufficient. JSON-LD fails
 * Google's rich-results eligibility for reasons that are perfectly valid JSON:
 *
 *   - a property that does not exist on the type ("hasCredential" is not a
 *     property of GeneralContractor)
 *   - a property whose value is the wrong shape (a string where an object or
 *     array is required)
 *   - a required property that is missing
 *   - a nested object with no @type, which is silently dropped
 *
 * None of those throw. The page looks fine, the markup validates as JSON, and
 * the rich result simply never appears.
 *
 * The checker below is deliberately offline and dependency-free: it holds the
 * property names and shapes for the handful of schema.org types this site
 * emits, and reports anything it does not recognise. A closed allow-list is
 * the point - if a property is added to the markup and not to this file, the
 * build fails, so an invented property cannot reach production unnoticed.
 *
 * When a type or property is added to the markup, add it here. The failure is
 * meant to be annoying.
 */
import fs from 'node:fs'
import path from 'node:path'

const DIST = path.join(process.cwd(), 'dist')

/**
 * The vocabulary this site is allowed to use.
 *
 * value shapes:
 *   'text'    string
 *   'text[]'  array of strings
 *   'node'    a nested object, which must itself carry an @type
 *   'node[]'  array of nested objects
 *
 * `required: true` means a rich result will not be granted without it.
 */
const VOCABULARY = {
  GeneralContractor: {
    required: ['@type', 'name'],
    props: {
      '@type': 'text',
      '@id': 'text',
      name: 'text',
      url: 'text',
      image: 'text',
      logo: 'text',
      description: 'text',
      telephone: 'text',
      email: 'text',
      // Deliberately absent: address. PRODUCT.md records no confirmed Egypt
      // street address, and inventing one to satisfy a schema would publish a
      // false claim to Google's knowledge panel. See verifiedStandards() for
      // the same reasoning applied to NFPA citations.
      foundingDate: 'text',
      // areaServed accepts Text, Place, or an array of either. Emitted here as
      // an array of Country nodes, which is what schema.org documents and what
      // Google reads for a service-area signal.
      areaServed: 'any',
      knowsAbout: 'text[]',
      hasCredential: 'node[]',
      openingHoursSpecification: 'node[]',
      parentOrganization: 'node',
      subOrganization: 'node[]',
      makesOffer: 'node',
      contactPoint: 'node[]',
      priceRange: 'text',
      slogan: 'text',
      sameAs: 'text[]',
      // GeneralContractor is a LocalBusiness, so it inherits every Thing and
      // Organization property, including hasOfferCatalog.
      hasOfferCatalog: 'node',
    },
  },
  WebSite: {
    required: ['@type', 'name', 'url'],
    props: {
      '@type': 'text',
      '@id': 'text',
      name: 'text',
      url: 'text',
      description: 'text',
      inLanguage: 'text',
      publisher: 'node',
      potentialAction: 'node[]',
    },
  },
  WebPage: {
    required: ['@type'],
    props: {
      '@type': 'text',
      '@id': 'text',
      url: 'text',
      name: 'text',
      description: 'text',
      isPartOf: 'node',
      about: 'node',
      breadcrumb: 'node',
      primaryImageOfPage: 'node',
      inLanguage: 'text',
    },
  },
  Service: {
    required: ['@type', 'name'],
    props: {
      '@type': 'text',
      '@id': 'text',
      name: 'text',
      serviceType: 'text',
      description: 'text',
      url: 'text',
      provider: 'node',
      // Same as GeneralContractor: Text, Place, or an array of either. Emitted
      // as an array of Country nodes.
      areaServed: 'any',
      offers: 'node',
      hasOfferCatalog: 'node',
      serviceOutput: 'text[]',
    },
  },
  OfferCatalog: {
    required: ['@type', 'name'],
    props: {
      '@type': 'text',
      name: 'text',
      itemListElement: 'node[]',
    },
  },
  Offer: {
    required: ['@type'],
    props: {
      '@type': 'text',
      itemOffered: 'node',
      priceCurrency: 'text',
      price: 'text',
      availability: 'text',
      url: 'text',
    },
  },
  BreadcrumbList: {
    required: ['@type', 'itemListElement'],
    props: {
      '@type': 'text',
      '@id': 'text',
      itemListElement: 'node[]',
      numberOfItems: 'text',
    },
  },
  ListItem: {
    required: ['@type', 'position', 'name'],
    props: {
      '@type': 'text',
      position: 'text',
      name: 'text',
      item: 'text',
    },
  },
  Organization: {
    required: ['@type', 'name'],
    props: {
      '@type': 'text',
      '@id': 'text',
      name: 'text',
      url: 'text',
      logo: 'text',
      image: 'text',
      description: 'text',
      telephone: 'text',
      email: 'text',
      address: 'node',
      contactPoint: 'node[]',
      sameAs: 'text[]',
      openingHoursSpecification: 'node[]',
      parentOrganization: 'node',
      subOrganization: 'node[]',
      knowsAbout: 'text[]',
      foundingDate: 'text',
      areaServed: 'text',
      slogan: 'text',
    },
  },
  ContactPoint: {
    required: ['@type', 'contactType'],
    props: {
      '@type': 'text',
      contactType: 'text',
      telephone: 'text',
      email: 'text',
      areaServed: 'text',
      availableLanguage: 'text[]',
      url: 'text',
    },
  },
  PostalAddress: {
    required: ['@type'],
    props: {
      '@type': 'text',
      streetAddress: 'text',
      addressLocality: 'text',
      addressRegion: 'text',
      postalCode: 'text',
      addressCountry: 'text',
    },
  },
  OpeningHoursSpecification: {
    required: ['@type', 'dayOfWeek'],
    props: {
      '@type': 'text',
      dayOfWeek: 'text[]',
      opens: 'text',
      closes: 'text',
      validFrom: 'text',
      validThrough: 'text',
    },
  },
  EducationalOccupationalCredential: {
    required: ['@type'],
    props: {
      '@type': 'text',
      credentialCategory: 'text',
      name: 'text',
      description: 'text',
      recognizedBy: 'node',
    },
  },
  // Place types, used for areaServed.
  Country: {
    required: ['@type'],
    props: { '@type': 'text', name: 'text', alternateName: 'text' },
  },
  City: {
    required: ['@type'],
    props: { '@type': 'text', name: 'text', alternateName: 'text' },
  },
  AdministrativeArea: {
    required: ['@type'],
    props: { '@type': 'text', name: 'text', alternateName: 'text' },
  },
  // Government bodies, used as the recognizer of a credential.
  GovernmentOrganization: {
    required: ['@type', 'name'],
    props: {
      '@type': 'text',
      '@id': 'text',
      name: 'text',
      url: 'text',
      description: 'text',
      sameAs: 'text[]',
      subOrganization: 'node[]',
    },
  },
  // A property-bearing node that is not a top-level @graph member.
  ImageObject: {
    required: ['@type'],
    props: {
      '@type': 'text',
      url: 'text',
      contentUrl: 'text',
      width: 'text',
      height: 'text',
      caption: 'text',
    },
  },
  SearchAction: {
    required: ['@type'],
    props: {
      '@type': 'text',
      target: 'text',
      'query-input': 'text',
    },
  },
}

// --- shape checks -----------------------------------------------------------
const failures = []
const fail = (where, message) => failures.push(`${where}: ${message}`)

function checkShape(where, shape, value, key) {
  switch (shape) {
    case 'text':
      if (typeof value !== 'string' && typeof value !== 'number') {
        fail(where, `"${key}" should be a string, got ${Array.isArray(value) ? 'array' : typeof value}`)
      }
      if (value === '') fail(where, `"${key}" is an empty string`)
      return
    case 'text[]':
      if (!Array.isArray(value)) {
        fail(where, `"${key}" should be an array, got ${typeof value}`)
        return
      }
      value.forEach((v, i) => {
        if (typeof v !== 'string') fail(where, `"${key}[${i}]" should be a string`)
      })
      return
    case 'node':
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        fail(where, `"${key}" should be an object, got ${Array.isArray(value) ? 'array' : typeof value}`)
        return
      }
      checkNode(`${where} > ${key}`, value)
      return
    case 'node[]':
      if (!Array.isArray(value)) {
        fail(where, `"${key}" should be an array of objects, got ${typeof value}`)
        return
      }
      value.forEach((v, i) => {
        if (v === null || typeof v !== 'object' || Array.isArray(v)) {
          fail(where, `"${key}[${i}]" should be an object`)
        } else {
          checkNode(`${where} > ${key}[${i}]`, v)
        }
      })
      return
    case 'any':
      // schema.org allows several shapes for the same property (Text, or a
      // Place node, or an array of either). Only structural sanity is checked.
      if (value === null || value === undefined) fail(where, `"${key}" is null`)
      else if (typeof value === 'object' && !Array.isArray(value)) {
        if (!value['@type'] && !value['@id']) {
          fail(where, `"${key}" is an object with neither @type nor @id - consumers will drop it`)
        } else if (value['@type']) {
          checkNode(`${where} > ${key}`, value)
        }
      } else if (typeof value === 'string' && value === '') {
        fail(where, `"${key}" is an empty string`)
      }
      return
    default:
      fail(where, `unknown shape "${shape}" for "${key}" - add it to the vocabulary`)
  }
}

function checkNode(where, node) {
  // A node that is nothing but {"@id": "..."} is a reference, not an
  // embedded definition. This is standard, recommended JSON-LD - it is how a
  // @graph avoids repeating the organization on every node that points at it -
  // and such a node is resolved against the graph by the consumer. It
  // deliberately has no @type: the type is declared once, on the node it
  // references. Requiring @type here flagged correct markup as broken.
  const keys = Object.keys(node)
  if (keys.length === 1 && keys[0] === '@id') {
    if (typeof node['@id'] !== 'string' || node['@id'] === '') {
      fail(where, 'is a bare @id reference with an empty or non-string @id')
    }
    return
  }

  const type = node['@type']
  const spec = VOCABULARY[type]

  if (!spec) {
    fail(where, `"@type": "${type}" is not in the vocabulary. Add it, or the property is unverifiable.`)
    return
  }

  for (const key of keys) {
    if (!(key in spec.props)) {
      fail(
        where,
        `"${key}" is not a known property of ${type}. If it is real, add it to the ` +
          'vocabulary; if it is not, it will be ignored by Google and is dead weight.'
      )
      continue
    }
    checkShape(where, spec.props[key], node[key], key)
  }

  for (const key of spec.required) {
    if (!(key in node)) {
      fail(where, `${type} is missing required "${key}" - the rich result will not be granted`)
    }
  }
}

// --- walk every page --------------------------------------------------------
// Recursive. The 13 service pages live at dist/services/<id>/index.html, not at
// the top level, so a flat readdir validated only the 6 root pages and never saw
// the Service or OfferCatalog nodes - the most interesting markup on the site,
// and exactly the nodes a rich result depends on.
function walk(dir, base = dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full, base))
    else if (entry.name.endsWith('.html')) out.push(path.relative(base, full).replace(/\\/g, '/'))
  }
  return out
}

const pages = fs.existsSync(DIST) ? walk(DIST) : []
if (pages.length === 0) {
  console.error('  dist/ has no HTML - run `npm run build` first.')
  process.exit(1)
}

const typeCounts = new Map()
let docsChecked = 0
let pagesWithoutLd = []

for (const page of pages) {
  const html = fs.readFileSync(path.join(DIST, page), 'utf8')
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]

  if (blocks.length === 0) {
    // The 404 is intentionally bare: it is noindex, and structured data on a
    // page that should never be indexed would be a claim about a URL that does
    // not exist.
    if (page !== '404.html') pagesWithoutLd.push(page)
    continue
  }

  for (const [, raw] of blocks) {
    let doc
    try {
      doc = JSON.parse(raw)
    } catch (e) {
      fail(page, `JSON-LD does not parse: ${e.message}`)
      continue
    }
    docsChecked += 1

    if (doc['@context'] !== 'https://schema.org') {
      fail(page, `@context is "${doc['@context']}", expected "https://schema.org"`)
    }

    if (!Array.isArray(doc['@graph'])) {
      fail(page, 'no @graph array - the document must use @graph')
      continue
    }

    for (const [i, node] of doc['@graph'].entries()) {
      const type = node['@type']
      typeCounts.set(type, (typeCounts.get(type) || 0) + 1)
      checkNode(`${page} @graph[${i}] (${type})`, node)
    }
  }
}

if (pagesWithoutLd.length) {
  for (const p of pagesWithoutLd) fail(p, 'page has no JSON-LD block')
}

// --- report -----------------------------------------------------------------
const pad = (v, n) => String(v).padEnd(n)
const rpad = (v, n) => String(v).padStart(n)

console.log(`\nvalidating JSON-LD against the schema.org vocabulary\n${'-'.repeat(64)}`)
console.log(`  pages scanned : ${pages.length} (404.html is intentionally bare)`)
console.log(`  documents     : ${docsChecked}`)
console.log('')
console.log(`${pad('type', 34)}${rpad('nodes', 8)}`)
console.log('-'.repeat(64))
for (const [type, count] of [...typeCounts.entries()].sort()) {
  console.log(pad(type, 34) + rpad(count, 8))
}
console.log('-'.repeat(64))
console.log(`${pad(`${typeCounts.size} distinct types`, 34)}${rpad(
  [...typeCounts.values()].reduce((a, b) => a + b, 0),
  8
)}`)
console.log('')

if (failures.length) {
  console.log(`${'x'.repeat(64)}\nFAILED (${failures.length})`)
  for (const f of failures) console.log(`  - ${f}`)
  console.log('')
  process.exit(1)
}

console.log(`${'='.repeat(64)}`)
console.log('PASSED - every property exists on its type, with the right shape\n')
console.log('  Note: this checks the vocabulary, not eligibility. Google\'s rich-results')
console.log('  test is the authority on whether a given type earns a result:\n')
console.log('    https://search.google.com/test/rich-results\n')
