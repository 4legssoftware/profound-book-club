import { execSync } from 'child_process';

export type Environment = 'dev' | 'stage' | 'prod';

const FQDN_ROOTS: Record<Environment, string> = {
  dev: 'dev.profound-book-club.org',
  stage: 'stage.profound-book-club.org',
  prod: 'profound-book-club.org',
};

const STACK_NAME = 'ProfoundBookClubStack';

export type Target = {
  environment: string;
  url: URL;
  fqdnRoot: string | undefined;
};

function isEnvironment(value: string): value is Environment {
  return value in FQDN_ROOTS;
}

function stackWebsiteUrl(): string | undefined {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-east-2';
  try {
    const websiteUrl = execSync(
      `aws cloudformation describe-stacks --stack-name ${STACK_NAME} --region ${region} ` +
        "--query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' --output text 2>/dev/null",
      { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] },
    ).trim();
    return websiteUrl && websiteUrl !== 'None' ? websiteUrl : undefined;
  } catch {
    return undefined;
  }
}

function resolveSiteUrl(environment: string): string {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL;
  }

  if (process.argv[2]) {
    return process.argv[2];
  }

  if (process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION) {
    const websiteUrl = stackWebsiteUrl();
    if (websiteUrl) {
      return websiteUrl;
    }
  }

  if (!isEnvironment(environment)) {
    console.error(`Error: Unknown environment "${environment}". Must be one of: dev, stage, prod`);
    process.exit(1);
  }

  return `https://${FQDN_ROOTS[environment]}`;
}

export function resolveTarget(): Target {
  const environment = process.env.ENVIRONMENT || 'dev';
  const siteUrl = resolveSiteUrl(environment);

  return {
    environment,
    url: new URL(siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`),
    fqdnRoot: isEnvironment(environment) ? FQDN_ROOTS[environment] : undefined,
  };
}
