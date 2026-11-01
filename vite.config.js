import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Extra pages: hyruki.cc/peek, hyruki.cc/fidget
const PAGES = ['peek', 'fidget']

// Vercel rewrites /peek to /peek/index.html (vercel.json); do the same in dev,
// otherwise the bare path falls through to the home page
const pageRewrites = {
  name: 'page-rewrites',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const [path, query] = req.url.split('?')
      if (PAGES.some((p) => path === `/${p}`)) req.url = `${path}/index.html${query ? `?${query}` : ''}`
      next()
    })
  },
}

export default defineConfig({
  plugins: [pageRewrites, react(), tailwindcss()],
  server: { port: 5173 },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        ...Object.fromEntries(PAGES.map((p) => [p, `${p}/index.html`])),
      },
    },
  },
})
