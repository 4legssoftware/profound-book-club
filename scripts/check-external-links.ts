#!/usr/bin/env node

import { existsSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';

import { checkLink } from './external-links/check-links.js';
import { crawl } from './external-links/crawl-html.js';
import { parseExpected } from './external-links/parse-expected.js';

function repoRoot(): string {
  const scriptPath = process.argv[1];
  if (!scriptPath) {
    throw new Error('Could not resolve the script path');
  }
  return join(dirname(scriptPath), '..');
}

const projectRoot = repoRoot();

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
