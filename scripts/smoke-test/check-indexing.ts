import { fetchPage } from './http.js';
import type { Results } from './results.js';

const MISSING_PATH = '/smoke-test-missing-page';
const NOT_FOUND_TITLE = 'Page not found';

async function checkNoindexHeader(
  origin: URL,
  environment: string,
  results: Results,
): Promise<void> {
  const { fullUrl, headers, error } = await fetchPage(origin, '/');

  if (error) {
    results.fail(`${fullUrl} - ${error}`);
    return;
  }

  const robotsTag = headers['x-robots-tag'] ?? '';
  const expectNoindex = environment !== 'prod';
  const hasNoindex = String(robotsTag).includes('noindex');

  if (expectNoindex && !hasNoindex) {
    results.fail(`${fullUrl} - missing X-Robots-Tag: noindex`);
  } else if (!expectNoindex && hasNoindex) {
    results.fail(`${fullUrl} - prod must not send X-Robots-Tag: ${robotsTag}`);
  } else {
    results.pass(`${fullUrl} - X-Robots-Tag ${expectNoindex ? 'noindex' : 'absent'}`);
  }
}

async function checkMissingPage(origin: URL, results: Results): Promise<void> {
  const { fullUrl, statusCode, body, error } = await fetchPage(origin, MISSING_PATH);

  if (error) {
    results.fail(`${fullUrl} - ${error}`);
    return;
  }

  if (statusCode !== 404) {
    results.fail(`${fullUrl} - expected 404, got ${statusCode}`);
    return;
  }

  if (!body.includes(NOT_FOUND_TITLE)) {
    results.fail(`${fullUrl} - 404 without the site's not-found page`);
    return;
  }

  results.pass(`${fullUrl} - 404 with not-found page`);
}

export async function checkIndexing(
  origin: URL,
  environment: string,
  results: Results,
): Promise<void> {
  await checkNoindexHeader(origin, environment, results);
  await checkMissingPage(origin, results);
}
