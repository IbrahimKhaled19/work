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
 *
 * WHY THIS FILE HAS ITS OWN ROUTER
 * -------------------------------
 * App.jsx code-splits its routes with React.lazy for the browser, and
 * renderToString cannot await a lazy component - it would emit the Suspense
 * fallback for every route and prerender 19 empty pages. Rewriting React.lazy
 * globally is not possible from an ES module, because the binding is read-only.
 *
 * So the SSR build renders its own equivalent route table with eager imports.
 * The duplication is the point: it is the only way to get synchronous,
 * fully-rendered HTML out of a lazily-routed tree.
 *
 * scripts/verify-prerender-lazy.mjs asserts this table and App.jsx declare the
 * same set of routes, so a route added to one without the other fails the build.
 * The failure mode being guarded against is 19 pages of empty markup, which is
 * precisely the bug prerendering was introduced to prevent.
 */

import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'

import Layout from './components/Layout'
import Home from './pages/Home'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import About from './pages/About'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import Careers from './pages/Careers'
import NotFound from './pages/NotFound'

/**
 * The eager equivalent of App.jsx's route table.
 *
 * Keep in step with App.jsx - `npm run verify` fails if they diverge.
 */
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:serviceId" element={<ServiceDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

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
