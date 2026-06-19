import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/Pokedex/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Pokédex',
        short_name: 'Pokédex',
        description: 'Een Pokédex PWA',
        theme_color: '#c62828',
        background_color: '#1a1a2e',
        display: 'standalone',
        icons: [
          {
            src: '/pokeball.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pokeball.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
})