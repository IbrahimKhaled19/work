/**
 * Client-side head management for SPA navigation.
 *
 * The prerenderer (Phase 2) writes correct head tags into each static HTML
 * file, so this component is NOT responsible for first load - crawlers and
 * social scrapers get their metadata from the prerendered markup.
 *
 * It exists for one gap prerendering cannot cover: when a visitor clicks a
 * react-router <Link>, no document is fetched, so the head would otherwise
 * keep showing the previous page's title and description.
 *
 * Renders nothing. All DOM work is inside useEffect, so renderToString in the
 * prerender step produces no output from this component.
 */

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getRouteMeta, notFoundMeta } from '../seo/routeMeta.js'
import site, { canonicalFor } from '../seo/site.js'

function setMeta(attr, key, content) {
  if (!content) return
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

export default function Seo() {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = getRouteMeta(pathname) || {
      ...notFoundMeta,
      canonical: canonicalFor(pathname),
    }

    document.title = meta.title
    setMeta('name', 'description', meta.description)
    setMeta('name', 'robots', meta.robots)
    setMeta('property', 'og:title', meta.title)
    setMeta('property', 'og:description', meta.description)
    setMeta('property', 'og:url', meta.canonical)
    setMeta('property', 'og:type', meta.ogType || 'website')
    setMeta('property', 'og:site_name', site.name)
    setMeta('name', 'twitter:title', meta.title)
    setMeta('name', 'twitter:description', meta.description)
    setCanonical(meta.canonical)
  }, [pathname])

  return null
}
