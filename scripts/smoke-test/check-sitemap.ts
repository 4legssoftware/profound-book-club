import { fetchPage, type FetchResult } from './http.js';
import type { Results } from './results.js';

const CANONICAL_ORIGIN = 'https://profound-book-club.org';
const SITEMAP_INDEX_PATH = '/sitemap-index.xml';
const SITEMAP_PATH = '/sitemap-0.xml';
const ROBOTS_PATH = '/robots.txt';
const SITEMAP_LINE = `Sitemap: ${CANONICAL_ORIGIN}${SITEMAP_INDEX_PATH}`;

// Stage and dev serve the same build, so the sitemap always lists apex URLs whichever host is under test.
const REQUIRED_PAGE_URLS = [`${CANONICAL_ORIGIN}/`, `${CANONICAL_ORIGIN}/conversations/`];

function locTag(pageUrl: string): string {
  return `<loc>${pageUrl}</loc>`;
}

async function fetchOk(origin: URL, path: string, results: Results): Promise<FetchResult | null> {
  const result = await fetchPage(origin, path);

  if (result.error) {
    results.fail(`${result.fullUrl} - ${result.error}`);
    return null;
  }

  if (result.statusCode !== 200) {
    results.fail(`${result.fullUrl} - ${result.statusCode}`);
    return null;
  }

  results.pass(`${result.fullUrl} - ${result.statusCode}`);
  return result;
}

export async function checkRobotsAndSitemap(origin: URL, results: Results): Promise<void> {
  const robots = await fetchOk(origin, ROBOTS_PATH, results);
  if (robots && !robots.body.includes(SITEMAP_LINE)) {
    results.fail(`${robots.fullUrl} - missing ${SITEMAP_LINE}`);
  } else if (robots) {
    results.pass(`${robots.fullUrl} - Sitemap line present`);
  }

  const index = await fetchOk(origin, SITEMAP_INDEX_PATH, results);
  const sitemapLoc = locTag(`${CANONICAL_ORIGIN}${SITEMAP_PATH}`);
  if (index && !index.body.includes(sitemapLoc)) {
    results.fail(`${index.fullUrl} - missing ${sitemapLoc}`);
  }

  const sitemap = await fetchOk(origin, SITEMAP_PATH, results);
  if (!sitemap) {
    return;
  }

  const missing = REQUIRED_PAGE_URLS.map(locTag).filter((loc) => !sitemap.body.includes(loc));
  for (const loc of missing) {
    results.fail(`${sitemap.fullUrl} - missing ${loc}`);
  }

  const listsNotFound = sitemap.body.includes('/404');
  if (listsNotFound) {
    results.fail(`${sitemap.fullUrl} - lists /404`);
  }

  if (missing.length === 0 && !listsNotFound) {
    results.pass(`${sitemap.fullUrl} - apex pages only`);
  }
}
