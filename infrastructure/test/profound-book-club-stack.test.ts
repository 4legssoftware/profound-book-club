import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { CertificateStack } from '../lib/certificate-stack';
import { envConfig, getWwwHostname } from '../lib/env-config';
import { ProfoundBookClubStack } from '../profound-book-club-stack';

describe('ProfoundBookClubStack', () => {
  test('creates private S3 bucket with OAC-backed CloudFront distribution', () => {
    const app = new App();
    const stack = new ProfoundBookClubStack(app, 'TestStack', {
      env: envConfig.dev,
      fqdnRoot: envConfig.dev.fqdnRoot,
      bucketName: envConfig.dev.bucketName,
      environment: 'dev',
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });

    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        DefaultRootObject: 'index.html',
        CustomErrorResponses: Match.arrayWith([
          Match.objectLike({
            ErrorCode: 404,
            ResponseCode: 200,
            ResponsePagePath: '/404.html',
          }),
          Match.objectLike({
            ErrorCode: 403,
            ResponseCode: 200,
            ResponsePagePath: '/404.html',
          }),
        ]),
        Origins: Match.arrayWith([
          Match.objectLike({
            OriginAccessControlId: Match.anyValue(),
          }),
        ]),
      }),
    });
  });

  test('with certificate adds www redirect function and alternate domain names', () => {
    const app = new App();
    const stack = new ProfoundBookClubStack(app, 'TestStackCert', {
      env: envConfig.prod,
      fqdnRoot: envConfig.prod.fqdnRoot,
      bucketName: envConfig.prod.bucketName,
      environment: 'prod',
      certificateArn:
        'arn:aws:acm:us-east-1:727508844146:certificate/00000000-0000-0000-0000-000000000000',
    });

    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::CloudFront::Function', 1);
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        Aliases: Match.arrayEquals([
          envConfig.prod.fqdnRoot,
          getWwwHostname(envConfig.prod.fqdnRoot),
        ]),
        DefaultCacheBehavior: Match.objectLike({
          FunctionAssociations: Match.arrayWith([
            Match.objectLike({
              EventType: 'viewer-request',
            }),
          ]),
        }),
      }),
    });
  });
});

describe('CertificateStack', () => {
  test('requests certificate in us-east-1 with www SAN', () => {
    const app = new App();
    const stack = new CertificateStack(app, 'TestCertStack', {
      env: { account: envConfig.dev.account, region: 'us-east-1' },
      fqdnRoot: envConfig.dev.fqdnRoot,
      environment: 'dev',
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::CertificateManager::Certificate', {
      DomainName: envConfig.dev.fqdnRoot,
      SubjectAlternativeNames: [getWwwHostname(envConfig.dev.fqdnRoot)],
      ValidationMethod: 'DNS',
    });
  });
});
