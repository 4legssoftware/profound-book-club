import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  outDir: './dist',
  site: 'https://profound-book-club.org',
  // Component styles stay in /_astro/*.css so style-src does not need 'unsafe-inline'.
  build: {
    inlineStylesheets: 'never',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
    }),
  ],
});
