#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';

const REQUIRED_SECTION_IDS = ['current', 'chronology', 'conversations', 'psa', 'contact'];

const ASTRO_STYLESHEET_PATTERN =
  /rel=["']stylesheet["'][^>]*href=["'][^"']*\/_astro\/[^"']+\.css["']|href=["'][^"']*\/_astro\/[^"']+\.css["'][^>]*rel=["']stylesheet["']/i;

const envConfig = {
  dev: {
    fqdnRoot: 'dev.profound-book-club.org',
  },
  stage: {
    fqdnRoot: 'stage.profound-book-club.org',
  },
  prod: {
    fqdnRoot: 'profound-book-club.org',
  },
};

function getSiteUrl() {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL;
  }

  if (process.argv[2]) {
    return process.argv[2];
  }

  if (process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION) {
    try {
      const stackName = 'ProfoundBookClubStack';
      const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-2';
      const websiteUrl = execSync(
        `aws cloudformation describe-stacks --stack-name ${stackName} --region ${region} --query 'Stacks[0].Outputs[?OutputKey==\`WebsiteURL\`].OutputValue' --output text 2>/dev/null`,
        { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] },
      ).trim();

      if (websiteUrl && websiteUrl !== 'None' && websiteUrl.length > 0) {
        return websiteUrl;
      }
    } catch {
      // Fall through to FQDN fallback
    }
  }

  const config = envConfig[ENVIRONMENT];
  if (!config) {
    console.error(`Error: Unknown environment "${ENVIRONMENT}". Must be one of: dev, stage, prod`);
    process.exit(1);
  }

  return `https://${config.fqdnRoot}`;
}

const BASE_URL = getSiteUrl();

if (!BASE_URL) {
  console.error('Error: Could not determine site URL');
  process.exit(1);
}

const url = new URL(BASE_URL.startsWith('http') ? BASE_URL : `https://${BASE_URL}`);

const pages = ['/'];

let passed = 0;
let failed = 0;
const errors = [];

function recordFailure(error) {
  console.error(`❌ ${error}`);
  errors.push(error);
  failed++;
}

function recordPass(message) {
  console.log(`✅ ${message}`);
  passed++;
}

function fetchPage(path) {
  return new Promise((resolve) => {
    const fullUrl = `${url.origin}${path}`;
    const client = url.protocol === 'https:' ? https : http;
    const chunks = [];

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path,
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'profound-book-club-smoke-test/1.0',
      },
    };

    const req = client.request(options, (res) => {
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        resolve({
          fullUrl,
          statusCode: res.statusCode,
          body: Buffer.concat(chunks).toString('utf-8'),
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        fullUrl,
        statusCode: 0,
        body: '',
        error: err.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        fullUrl,
        statusCode: 0,
        body: '',
        error: 'Timeout',
      });
    });

    req.end();
  });
}

function checkHomePageContent(fullUrl, html) {
  if (!ASTRO_STYLESHEET_PATTERN.test(html)) {
    recordFailure(`${fullUrl} - missing /_astro/ stylesheet link`);
    return;
  }

  recordPass(`${fullUrl} - /_astro/ stylesheet link present`);

  for (const sectionId of REQUIRED_SECTION_IDS) {
    if (!html.includes(`id="${sectionId}"`)) {
      recordFailure(`${fullUrl} - missing section anchor id="${sectionId}"`);
      return;
    }
  }

  recordPass(`${fullUrl} - section anchors present (${REQUIRED_SECTION_IDS.join(', ')})`);
}

async function checkPage(path) {
  const { fullUrl, statusCode, body, error } = await fetchPage(path);

  if (error) {
    recordFailure(`${fullUrl} - ${error}`);
    return false;
  }

  if (statusCode < 200 || statusCode >= 400) {
    recordFailure(`${fullUrl} - ${statusCode}`);
    return false;
  }

  recordPass(`${fullUrl} - ${statusCode}`);

  if (path === '/') {
    checkHomePageContent(fullUrl, body);
  }

  return true;
}

function checkWwwRedirect() {
  return new Promise((resolve) => {
    const config = envConfig[ENVIRONMENT];
    if (!config) {
      resolve(true);
      return;
    }

    const wwwHostname = `www.${config.fqdnRoot}`;
    const canonicalUrl = `https://${config.fqdnRoot}/`;
    const fullUrl = `https://${wwwHostname}/`;

    const options = {
      hostname: wwwHostname,
      port: 443,
      path: '/',
      method: 'GET',
      timeout: 10000,
      headers: {
        'User-Agent': 'profound-book-club-smoke-test/1.0',
      },
    };

    const req = https.request(options, (res) => {
      res.on('data', () => {});

      res.on('end', () => {
        const location = res.headers.location || '';
        if (
          res.statusCode >= 301 &&
          res.statusCode <= 308 &&
          location.replace(/\/$/, '') === canonicalUrl.replace(/\/$/, '')
        ) {
          recordPass(`${fullUrl} - ${res.statusCode} → ${location}`);
          resolve(true);
        } else {
          recordFailure(
            `${fullUrl} - expected 301 to ${canonicalUrl}, got ${res.statusCode} ${location}`,
          );
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      recordFailure(`${fullUrl} - ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      recordFailure(`${fullUrl} - Timeout`);
      resolve(false);
    });

    req.end();
  });
}

async function runSmokeTests() {
  console.log(`\n🧪 Running smoke tests for ${url.origin} (${ENVIRONMENT})\n`);

  for (const page of pages) {
    await checkPage(page);
  }

  await checkWwwRedirect();

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    console.error('Failed checks:');
    errors.forEach((error) => console.error(`  - ${error}`));
    process.exit(1);
  }

  console.log('✅ All smoke tests passed!');
  process.exit(0);
}

runSmokeTests().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
