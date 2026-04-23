export const pwaManifest = {
  name: 'Spartan Gains',
  short_name: 'SpartanGains',
  description:
    'A Halo 3-themed workout tracker that turns real training into rank progression.',
  theme_color: '#0a0c0f',
  background_color: '#0a0c0f',
  display: 'standalone' as const,
  orientation: 'portrait' as const,
  start_url: '/',
  scope: '/',
  lang: 'en',
  icons: [
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
};

export const pwaIncludeAssets = ['icons/icon-192.png', 'icons/icon-512.png'];

export const pwaWorkbox = {
  globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
  navigateFallback: 'index.html',
  navigateFallbackDenylist: [/^\/__\//],
};
