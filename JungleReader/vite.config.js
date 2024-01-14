import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg}']
      },
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'JungleReader',
        short_name: 'JungleReader',
        description: 'A free and open-source feed-reader. Follow YouTube, Reddit, Mastodon, blogs, RSS, and more.',
        theme_color: '#ffffff',
        icons: [
          {
            "src": "pwa-64x64.png",
            "sizes": "64x64",
            "type": "image/png"
          },
          {
            "src": "pwa-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
          },
          {
            "src": "pwa-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
          },
          {
            "src": "maskable-icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable"
          }
        ],
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      "Shared": fileURLToPath(new URL('../Shared', import.meta.url)),
    }
  },
  test: {
    environment: "jsdom"
  }
})
