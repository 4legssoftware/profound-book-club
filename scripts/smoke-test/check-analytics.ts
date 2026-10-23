import { fetchPage } from './http.js';
import type { Results } from './results.js';

const HTML_PATHS = ['/', '/conversations', '/404.html'];
const LOADER_PATH = '/analytics.js';
const LOADER_SRC = 'src="/analytics.js"';
const HOST_GUARD = "location.hostname !== 'profound-book-club.org'";

function expectLoaderReference(fullUrl: string, html: string, results: Results): void {
  if (!html.includes(LOADER_SRC)) {
    results.fail(`${fullUrl} - missing ${LOADER_SRC}`);
    return;
  }

  if (html.includes('cloud.umami.is')) {
    results.fail(`${fullUrl} - HTML names cloud.umami.is; the loader decides that in the browser`);
    return;
  }

  results.pass(`${fullUrl} - references /analytics.js`);
}

export async function checkAnalytics(origin: URL, results: Results): Promise<void> {
  for (const path of HTML_PATHS) {
    const page = await fetchPage(origin, path);

    if (page.error) {
      results.fail(`${page.fullUrl} - ${page.error}`);
      continue;
    }

    if (page.statusCode < 200 || page.statusCode >= 400) {
      results.fail(`${page.fullUrl} - ${page.statusCode}`);
      continue;
    }

    expectLoaderReference(page.fullUrl, page.body, results);
  }

  const loader = await fetchPage(origin, LOADER_PATH);

  if (loader.error) {
    results.fail(`${loader.fullUrl} - ${loader.error}`);
    return;
  }

  if (loader.statusCode !== 200) {
    results.fail(`${loader.fullUrl} - ${loader.statusCode}`);
    return;
  }

  if (!loader.body.includes(HOST_GUARD)) {
    results.fail(`${loader.fullUrl} - missing the Production hostname guard`);
    return;
  }

  results.pass(`${loader.fullUrl} - 200`);
}
