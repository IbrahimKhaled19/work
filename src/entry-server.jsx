/**
 * Server entry point for prerendering.
 *
 * Bundled separately by `vite build --ssr` and executed in Node by
 * scripts/prerender.mjs. Renders the same component tree the browser gets, but
 * to a string, so crawlers and social scrapers that never execute JavaScript
 * still receive real content.
 *
 * StaticRouter is imported from 'react-router-dom' rather than
 * 'react-router-dom/server' - that subpath does not exist in v7.
 */

import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App.jsx'

/**
 * @param {string} url pathname to render, e.g. '/services/fire-pump-systems'
 * @returns {{ html: string }}
 */
export function render(url) {
  const html = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  )
  return { html }
}

export default render
