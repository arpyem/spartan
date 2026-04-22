import { pwaIncludeAssets, pwaManifest, pwaWorkbox } from '@/lib/pwa';

describe('PWA config', () => {
  it('exposes the release manifest values from a single source of truth', () => {
    expect(pwaManifest).toMatchObject({
      name: 'Spartan Gains',
      short_name: 'SpartanGains',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      orientation: 'portrait',
      theme_color: '#0a0c0f',
      background_color: '#0a0c0f',
      lang: 'en',
    });
    expect(pwaManifest.description).toMatch(/Halo 3-themed workout tracker/i);
    expect(pwaManifest.icons).toEqual([
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ]);
  });

  it('keeps the offline shell assets and workbox navigation fallback explicit', () => {
    expect(pwaIncludeAssets).toEqual(['icons/icon-192.png', 'icons/icon-512.png']);
    expect(pwaWorkbox.navigateFallback).toBe('index.html');
    expect(pwaWorkbox.globPatterns).toContain('**/*.{js,css,html,ico,png,svg,woff2}');
  });
});
