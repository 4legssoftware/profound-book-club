#!/usr/bin/env node

import { checkIndexing } from './smoke-test/check-indexing.js';
import { checkPages } from './smoke-test/check-pages.js';
import { checkRobotsAndSitemap } from './smoke-test/check-sitemap.js';
import { checkWwwRedirect } from './smoke-test/check-www-redirect.js';
import { createResults } from './smoke-test/results.js';
import { resolveTarget } from './smoke-test/target.js';

async function main(): Promise<void> {
  const { environment, url, fqdnRoot } = resolveTarget();
  const results = createResults();

  console.log(`\n🧪 Running smoke tests for ${url.origin} (${environment})\n`);

  await checkPages(url, results);
  await checkRobotsAndSitemap(url, results);
  await checkIndexing(url, environment, results);
  await checkWwwRedirect(fqdnRoot, results);

  process.exit(results.report() ? 0 : 1);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
