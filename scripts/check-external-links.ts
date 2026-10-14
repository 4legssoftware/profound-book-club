#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

const EXCLUDED_HOSTS = new Set([
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'schema.org',
  'www.w3.org',
]);

const USER_AGENT = 'profound-book-club-link-check/1.0';

type ExpectedLinks = {
  urls: string[];
  reviewTitles: Map<string, string>;
  error?: string;
};

function parseArgs(argv: string[]): { htmlDir: string; expectedPath: string } {
  let htmlDir = join(projectRoot, 'dist');
  let expectedPath = join(projectRoot, 'docs/external-links.md');

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--expected') {
      const value = argv[index + 1];
      if (!value) {
        throw new Error('Pass a path after --expected');
      }
      expectedPath = resolve(value);
      index += 1;
    } else if (!arg.startsWith('--')) {
      htmlDir = resolve(arg);
    }
  }

  return { htmlDir, expectedPath };
}

function isOwnHost(hostname: string): boolean {
  return hostname === 'profound-book-club.org' || hostname.endsWith('.profound-book-club.org');
}

function toVisitorUrl(href: string): string | null {
  let url: URL;
  try {
    url = new URL(href, 'https://profound-book-club.org');
  } catch {
    return null;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return null;
  }
  if (isOwnHost(url.hostname) || EXCLUDED_HOSTS.has(url.hostname)) {
    return null;
  }

  url.hash = '';
  return url.href;
}

function htmlFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      files.push(...htmlFiles(path));
    } else if (entry.endsWith('.html')) {
      files.push(path);
    }
  }
  return files;
}

function crawl(dir: string): Set<string> {
  const links = new Set<string>();
  const hrefPattern = /href\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;

  for (const file of htmlFiles(dir)) {
    const html = readFileSync(file, 'utf8');
    for (const match of html.matchAll(hrefPattern)) {
      const visitorUrl = toVisitorUrl(match[1] ?? match[2] ?? '');
      if (visitorUrl) {
        links.add(visitorUrl);
      }
    }
  }

  return links;
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, digits: string) => String.fromCodePoint(Number(digits)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

function urlsIn(section: string): string[] {
  return [...section.matchAll(/https?:\/\/[^\s)<]+/g)].map((match) => new URL(match[0]).href);
}

function reviewLabels(section: string): string[] {
  return section
    .split('\n')
    .filter((line) => line.startsWith('|'))
    .map((line) => line.split('|').map((cell) => cell.trim()))
    .filter((cells) => cells[1] && cells[1] !== 'Page' && !/^-+$/.test(cells[1]))
    .map((cells) => cells[2]);
}

function parseExpected(markdown: string): ExpectedLinks {
  const visitor = markdown.split(/^## Visitor links\s*$/m)[1]?.split(/^## Excluded\s*$/m)[0];
  if (!visitor) {
    return {
      urls: [],
      reviewTitles: new Map(),
      error: 'Expected list has no Visitor links section',
    };
  }

  const [reviewsPart, ofInterestPart = ''] = visitor.split(/^### Of Interest\s*$/m);
  const reviewUrls = urlsIn(reviewsPart);
  const labels = reviewLabels(reviewsPart);
  const reviewTitles = new Map<string, string>();

  if (reviewUrls.length !== labels.length) {
    return {
      urls: [...reviewUrls, ...urlsIn(ofInterestPart)],
      reviewTitles,
      error: `Expected list has ${labels.length} review titles and ${reviewUrls.length} review URLs`,
    };
  }

  reviewUrls.forEach((url, index) => {
    reviewTitles.set(url, labels[index]);
  });

  return { urls: [...reviewUrls, ...urlsIn(ofInterestPart)], reviewTitles };
}

function metaContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
}

function comparableWords(value: string): string[] {
  const stripped = decodeEntities(value)
    .toLowerCase()
    .replace(/[—–−‐\-“”‘’"'.,:;!?()]/g, ' ');
  return stripped.split(/\s+/).filter((word) => word.length > 0);
}

function wordsInOrder(needle: string[], haystack: string[]): boolean {
  let index = 0;
  for (const word of haystack) {
    if (index < needle.length && word === needle[index]) {
      index += 1;
    }
  }
  return index === needle.length;
}

function titleIsCurrent(html: string, storedTitle: string): boolean {
  const stored = comparableWords(storedTitle);
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1];
  const candidates = [metaContent(html, 'og:title'), title].filter(
    (value): value is string => value != null && value.length > 0,
  );
  return candidates.some((candidate) => {
    const live = comparableWords(candidate);
    return wordsInOrder(stored, live) || wordsInOrder(live, stored);
  });
}

function redirectProblem(stored: string, finalUrl: string): string | null {
  const from = new URL(stored);
  const to = new URL(finalUrl);
  if (from.hostname !== to.hostname) {
    return `host changed to ${to.hostname}`;
  }
  const path = (value: string) => value.replace(/\/$/, '') || '/';
  if (path(from.pathname) !== path(to.pathname) || from.search !== to.search) {
    return `path changed to ${to.pathname}${to.search}`;
  }
  return null;
}

async function checkLink(url: string, storedTitle: string | undefined): Promise<string | null> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `${url} is not active (${message})`;
  }

  const redirect = redirectProblem(url, response.url);
  if (response.status < 200 || response.status >= 300 || redirect) {
    const detail = redirect ?? `status ${response.status}`;
    return `${url} is not active (${detail})`;
  }

  if (!storedTitle) {
    return null;
  }

  const html = await response.text();
  if (!titleIsCurrent(html, storedTitle)) {
    return `${url} is active but the live title does not match the stored title`;
  }
  return null;
}

async function main(): Promise<void> {
  const { htmlDir, expectedPath } = parseArgs(process.argv.slice(2));

  if (!existsSync(htmlDir)) {
    console.error(`No HTML directory at ${htmlDir}. Build the site first: pnpm run build`);
    process.exit(1);
  }
  if (!existsSync(expectedPath)) {
    console.error(`No expected list at ${expectedPath}`);
    process.exit(1);
  }

  const crawled = crawl(htmlDir);
  const expected = parseExpected(readFileSync(expectedPath, 'utf8'));
  const expectedUrls = new Set(expected.urls);

  console.log(`Visitor links on the site: ${crawled.size}`);
  for (const url of crawled) {
    console.log(`  ${url}`);
  }

  const failures: string[] = [];
  if (expected.error) {
    failures.push(expected.error);
  }
  for (const url of crawled) {
    if (!expectedUrls.has(url)) {
      failures.push(`${url} is on the site and absent from the expected list`);
    }
  }
  for (const url of expected.urls) {
    if (!crawled.has(url)) {
      failures.push(`${url} is expected and absent from the site`);
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(failure);
    }
    process.exit(1);
  }

  for (const url of expected.urls) {
    const failure = await checkLink(url, expected.reviewTitles.get(url));
    if (failure) {
      failures.push(failure);
      console.error(failure);
    } else {
      console.log(`active ${url}`);
    }
  }

  if (failures.length > 0) {
    process.exit(1);
  }

  console.log(`External links match the expected list (${expected.urls.length})`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
