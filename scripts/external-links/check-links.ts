const USER_AGENT = 'profound-book-club-link-check/1.0';

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

export async function checkLink(
  url: string,
  storedTitle: string | undefined,
): Promise<string | null> {
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
