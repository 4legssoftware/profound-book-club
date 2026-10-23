import { upcomingBook } from '../../src/content/upcomingBook.js';
import { fetchPage } from './http.js';
import type { Results } from './results.js';

const PAGES = ['/', '/conversations'];

const REQUIRED_SECTION_IDS = ['current', 'chronology', 'conversations', 'psa', 'contact'];

const ASTRO_STYLESHEET_PATTERN =
  /rel=["']stylesheet["'][^>]*href=["'][^"']*\/_astro\/[^"']+\.css["']|href=["'][^"']*\/_astro\/[^"']+\.css["'][^>]*rel=["']stylesheet["']/i;

const CONVERSATIONS_PAGE_MARKER = 'class="conversations-page"';
const CONVERSATIONS_BACK_LINK = 'Back to the home page';

function requiredSectionIds(): string[] {
  return upcomingBook ? ['upcoming', ...REQUIRED_SECTION_IDS] : REQUIRED_SECTION_IDS;
}

function checkHomePageContent(fullUrl: string, html: string, results: Results): void {
  if (!ASTRO_STYLESHEET_PATTERN.test(html)) {
    results.fail(`${fullUrl} - missing /_astro/ stylesheet link`);
    return;
  }

  results.pass(`${fullUrl} - /_astro/ stylesheet link present`);

  const sectionIds = requiredSectionIds();
  const missing = sectionIds.find((sectionId) => !html.includes(`id="${sectionId}"`));
  if (missing) {
    results.fail(`${fullUrl} - missing section anchor id="${missing}"`);
    return;
  }

  results.pass(`${fullUrl} - section anchors present (${sectionIds.join(', ')})`);
}

function checkConversationsPageContent(fullUrl: string, html: string, results: Results): void {
  if (!html.includes(CONVERSATIONS_PAGE_MARKER)) {
    results.fail(`${fullUrl} - missing conversations page marker`);
    return;
  }

  if (!html.includes(CONVERSATIONS_BACK_LINK)) {
    results.fail(`${fullUrl} - missing back link to the home page`);
    return;
  }

  results.pass(`${fullUrl} - conversations page content present`);
}

export async function checkPages(origin: URL, results: Results): Promise<void> {
  for (const path of PAGES) {
    const { fullUrl, statusCode, body, error } = await fetchPage(origin, path);

    if (error) {
      results.fail(`${fullUrl} - ${error}`);
      continue;
    }

    if (statusCode < 200 || statusCode >= 400) {
      results.fail(`${fullUrl} - ${statusCode}`);
      continue;
    }

    results.pass(`${fullUrl} - ${statusCode}`);

    if (path === '/') {
      checkHomePageContent(fullUrl, body, results);
    }

    if (path === '/conversations') {
      checkConversationsPageContent(fullUrl, body, results);
    }
  }
}
