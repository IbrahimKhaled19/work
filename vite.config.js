import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // The prerenderer inlines this CSS into every generated page, so keep it
    // as one file. Splitting it per-route would work against that.
    cssCodeSplit: false,
    // Small SVGs and the generated manifest are cheaper inlined than as extra
    // round trips. 4 KB is Vite's default; stated explicitly because the image
    // pipeline output makes the trade-off visible.
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Function form, not the object map: Vite 8 bundles with rolldown,
        // which requires a function here. Keeping React and the router in a
        // separate long-lived chunk lets browsers reuse the cached copy across
        // deploys, since framework code changes far less often than page code.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) {
            return 'react'
          }
          return 'vendor'
        },
      },
    },
  },
})
