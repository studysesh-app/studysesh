// Precache the static export. The site is hosted at /studysesh/ (GitHub Pages),
// while `expo export` writes files at the root of dist/, so precache URLs need
// that prefix. `npm run build:web` overwrites the dev worker in dist/sw.js.
module.exports = {
  globDirectory: 'dist/',
  globPatterns: ['**/*.{html,js,css,png,ico,json,webmanifest,woff,woff2,ttf}'],
  globIgnores: ['**/sw.js', '**/*.map'],
  swDest: 'dist/sw.js',
  modifyURLPrefix: {
    '': '/studysesh/',
  },
  navigateFallback: '/studysesh/index.html',
  navigateFallbackDenylist: [/^\/studysesh\/_expo\//],
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
  skipWaiting: true,
  clientsClaim: true,
};
