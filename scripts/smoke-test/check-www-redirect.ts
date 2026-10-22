import { fetchPage } from './http.js';
import type { Results } from './results.js';

const REDIRECT_STATUS_MIN = 301;
const REDIRECT_STATUS_MAX = 308;

function withoutTrailingSlash(value: string): string {
  return value.replace(/\/$/, '');
}

export async function checkWwwRedirect(
  fqdnRoot: string | undefined,
  results: Results,
): Promise<void> {
  if (!fqdnRoot) {
    return;
  }

  const canonicalUrl = `https://${fqdnRoot}/`;
  const { fullUrl, statusCode, location, error } = await fetchPage(
    new URL(`https://www.${fqdnRoot}`),
    '/',
  );

  if (error) {
    results.fail(`${fullUrl} - ${error}`);
    return;
  }

  const isRedirect = statusCode >= REDIRECT_STATUS_MIN && statusCode <= REDIRECT_STATUS_MAX;
  if (isRedirect && withoutTrailingSlash(location) === withoutTrailingSlash(canonicalUrl)) {
    results.pass(`${fullUrl} - ${statusCode} → ${location}`);
  } else {
    results.fail(`${fullUrl} - expected 301 to ${canonicalUrl}, got ${statusCode} ${location}`);
  }
}
