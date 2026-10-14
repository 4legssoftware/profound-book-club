import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

const EXCLUDED_HOSTS = new Set([
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'schema.org',
  'www.w3.org',
]);

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

export function crawl(dir: string): Set<string> {
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
