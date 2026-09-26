import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// fonts.css carries the @font-face rules for the self-hosted Montserrat. It is
// imported before index.css so the faces are declared ahead of the rules that
// use them, and so both are inlined into the same <style> by the prerenderer -
// which is what removes the render-blocking Google Fonts <link> from index.html.
import './fonts.css'
import './index.css'
import App from './App.jsx'

document.documentElement.classList.add('js')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
