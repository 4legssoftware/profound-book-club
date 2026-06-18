#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CertificateStack } from '../lib/certificate-stack';
import { envConfig, Environment } from '../lib/env-config';
import { ProfoundBookClubStack } from '../profound-book-club-stack';

const app = new cdk.App();

const environment = (process.env.ENVIRONMENT || 'dev') as Environment;
const config = envConfig[environment];

const hostedZoneId = process.env.HOSTED_ZONE_ID?.trim() || undefined;
const certificateArn = process.env.CERTIFICATE_ARN?.trim() || undefined;
const deployCertsOnly = process.env.DEPLOY_CERTS_ONLY === 'true';
const skipDomainAliases = process.env.SKIP_DOMAIN_ALIASES === 'true';

if (deployCertsOnly) {
  new CertificateStack(app, `ProfoundBookClub-Certificate-${environment}`, {
    env: {
      account: config.account,
      region: 'us-east-1',
    },
    fqdnRoot: config.fqdnRoot,
    environment,
    hostedZoneId,
    stackName: `ProfoundBookClub-Certificate-${environment}`,
    description: `ACM Certificate for profound-book-club (${environment}) - CloudFront requires us-east-1`,
  });
}

if (!deployCertsOnly) {
  new ProfoundBookClubStack(app, 'ProfoundBookClubStack', {
    env: { account: config.account, region: config.region },
    fqdnRoot: config.fqdnRoot,
    bucketName: config.bucketName,
    environment,
    certificateArn,
    skipDomainAliases,
  });
}
