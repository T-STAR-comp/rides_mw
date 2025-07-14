import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        id: '/',
        name: 'Rides MW',
        short_name: 'Rides',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#42b983',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-square-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ],
        screenshots: [
          {
            src: "screenshot.png",
            sizes: "1916x901",
            type: "image/png",
            form_factor: "wide"
          },
          {
            src: "screenshot_mobile.png",
            sizes: "540x720",
            type: "image/png",
            form_factor: "narrow"
          }
        ]
      }
    })
  ]
})
