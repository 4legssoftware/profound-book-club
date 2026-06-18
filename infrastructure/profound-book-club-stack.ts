import * as cdk from 'aws-cdk-lib';
import { Certificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';
import { CloudFrontDistribution } from './lib/cloudfront-distribution';
import { Environment, getDomainNames } from './lib/env-config';
import { WebsiteBucket } from './lib/website-bucket';
import { WwwRedirectFunction } from './lib/www-redirect-function';

export interface ProfoundBookClubStackProps extends cdk.StackProps {
  fqdnRoot: string;
  bucketName: string;
  environment: Environment;
  certificateArn?: string;
  skipDomainAliases?: boolean;
}

export class ProfoundBookClubStack extends cdk.Stack {
  public readonly websiteBucket: WebsiteBucket;
  public readonly distribution: CloudFrontDistribution;

  constructor(scope: Construct, id: string, props: ProfoundBookClubStackProps) {
    super(scope, id, props);

    const { fqdnRoot, bucketName, environment, certificateArn, skipDomainAliases = false } = props;

    cdk.Tags.of(this).add('4ls:environment', environment);
    cdk.Tags.of(this).add('4ls:source', 'profound-book-club');
    cdk.Tags.of(this).add('4ls:application', 'profound-book-club');
    cdk.Tags.of(this).add('4ls:owner', 'platform');
    cdk.Tags.of(this).add('4ls:managed-by', 'cdk');

    const websiteBucket = new WebsiteBucket(this, 'WebsiteBucket', {
      bucketName,
      environment,
    });

    this.websiteBucket = websiteBucket;

    let certificate: ICertificate | undefined;
    let domainNames: string[] | undefined;
    let wwwRedirectFunction: WwwRedirectFunction | undefined;

    if (certificateArn && !skipDomainAliases) {
      certificate = Certificate.fromCertificateArn(this, 'Certificate', certificateArn);
      domainNames = getDomainNames(fqdnRoot);
      wwwRedirectFunction = new WwwRedirectFunction(this, 'WwwRedirect', environment);
    }

    const distribution = new CloudFrontDistribution(this, 'CloudFront', {
      environment,
      websiteBucket: websiteBucket.bucket,
      domainNames,
      certificate,
      wwwRedirectFunction: wwwRedirectFunction?.function,
    });

    this.distribution = distribution;

    const websiteUrl = certificate
      ? `https://${fqdnRoot}`
      : `https://${distribution.distribution.distributionDomainName}`;

    new cdk.CfnOutput(this, 'WebsiteURL', {
      value: websiteUrl,
      description: 'Frontend URL (custom domain if configured, otherwise CloudFront default)',
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: websiteBucket.bucket.bucketName,
      description: 'S3 Bucket Name',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distribution.distributionId,
      description: 'CloudFront Distribution ID',
    });
  }
}
