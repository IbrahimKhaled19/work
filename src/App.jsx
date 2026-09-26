import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

// Only the landing page is eager. Every other route is split, so a visitor
// landing on the homepage does not download the services catalogue, the gallery
// or the contact form.
//
// Why this matters more than it looks: the prerendered HTML already contains
// the full text of every page, so the page is *readable* and crawlable before
// any of this JavaScript runs. The bundle is only needed for interactivity -
// the mobile nav, the tabs, the form. Loading it lazily therefore costs the
// visitor nothing they can perceive, and saves every visitor who lands on one
// route from paying for the other five.
//
// Home stays eager deliberately. It is the entry point for most traffic, and
// deferring it would delay hydration of the page most people see.
//
// 404 is also eager: it is tiny, and a visitor who hits a bad URL should get a
// working page rather than a lazy boundary that resolves after a failed chunk
// request.
const Services = lazy(() => import('./pages/Services'))
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'))
const About = lazy(() => import('./pages/About'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Contact = lazy(() => import('./pages/Contact'))

/**
 * Route table only - no router.
 *
 * The router is supplied by the caller: <BrowserRouter> in src/main.jsx for
 * the client, <StaticRouter> in src/entry-server.jsx for prerendering. That
 * split is what lets the same component tree be rendered to a string in Node
 * for crawlers, which is the whole point of the prerender step.
 */
function App() {
  return (
    // Suspense wraps the lazy routes only. It renders nothing while a chunk is
    // in flight, which for a client-side navigation means the previous page
    // stays on screen until the next one is ready - the visitor never sees a
    // blank frame. For the initial load this fallback is never shown, because
    // the prerendered markup is already in the document and React hydrates on
    // top of it.
    <Suspense fallback={null}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:serviceId" element={<ServiceDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
