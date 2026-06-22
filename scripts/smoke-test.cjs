#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';

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

function checkPage(path) {
  return new Promise((resolve) => {
    const fullUrl = `${url.origin}${path}`;
    const client = url.protocol === 'https:' ? https : http;

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
      res.on('data', () => {});

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          console.log(`✅ ${fullUrl} - ${res.statusCode}`);
          passed++;
          resolve(true);
        } else {
          const error = `${fullUrl} - ${res.statusCode}`;
          console.error(`❌ ${error}`);
          errors.push(error);
          failed++;
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      const error = `${fullUrl} - ${err.message}`;
      console.error(`❌ ${error}`);
      errors.push(error);
      failed++;
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      const error = `${fullUrl} - Timeout`;
      console.error(`❌ ${error}`);
      errors.push(error);
      failed++;
      resolve(false);
    });

    req.end();
  });
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
          console.log(`✅ ${fullUrl} - ${res.statusCode} → ${location}`);
          passed++;
          resolve(true);
        } else {
          const error = `${fullUrl} - expected 301 to ${canonicalUrl}, got ${res.statusCode} ${location}`;
          console.error(`❌ ${error}`);
          errors.push(error);
          failed++;
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      const error = `${fullUrl} - ${err.message}`;
      console.error(`❌ ${error}`);
      errors.push(error);
      failed++;
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      const error = `${fullUrl} - Timeout`;
      console.error(`❌ ${error}`);
      errors.push(error);
      failed++;
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
