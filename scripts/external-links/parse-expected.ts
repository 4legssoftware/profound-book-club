export type ExpectedLinks = {
  urls: string[];
  reviewTitles: Map<string, string>;
  error?: string;
};

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

export function parseExpected(markdown: string): ExpectedLinks {
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
