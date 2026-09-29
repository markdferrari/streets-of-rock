import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: { target: 'es2022' },
  plugins: [VitePWA({
    strategies: 'injectManifest',
    injectRegister: null,
    srcDir: 'src',
    filename: 'sw.ts',
    injectManifest: { maximumFileSizeToCacheInBytes: 16 * 1024 * 1024,
      globPatterns: ['**/*.{html,js,css,png,glb,wav}'] },
    manifest: {
      name: 'Streets of Rock', short_name: 'Streets of Rock', start_url: '/', display: 'standalone',
      background_color: '#171024', theme_color: '#171024',
      icons: [
        { src: '/assets/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        { src: '/assets/icons/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
      ],
    },
  })],
});
