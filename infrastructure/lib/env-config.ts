export type Environment = 'dev' | 'stage' | 'prod';

export interface EnvConfig {
  account: string;
  region: string;
  fqdnRoot: string;
  bucketName: string;
}

export const hostedZoneName = 'profound-book-club.org';

export const envConfig: Record<Environment, EnvConfig> = {
  dev: {
    account: '637905408031',
    region: 'us-east-2',
    fqdnRoot: 'dev.profound-book-club.org',
    bucketName: 'dev.profound-book-club.org',
  },
  stage: {
    account: '883353268059',
    region: 'us-east-2',
    fqdnRoot: 'stage.profound-book-club.org',
    bucketName: 'stage.profound-book-club.org',
  },
  prod: {
    account: '727508844146',
    region: 'us-east-2',
    fqdnRoot: 'profound-book-club.org',
    bucketName: 'profound-book-club.org',
  },
};

export function getWwwHostname(fqdnRoot: string): string {
  return `www.${fqdnRoot}`;
}

export function getDomainNames(fqdnRoot: string): string[] {
  return [fqdnRoot, getWwwHostname(fqdnRoot)];
}
