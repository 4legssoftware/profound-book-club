import { App } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { CertificateStack } from '../lib/certificate-stack';
import { Environment, envConfig, getWwwHostname } from '../lib/env-config';
import { ProfoundBookClubStack } from '../profound-book-club-stack';

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' https://cloud.umami.is",
  "connect-src 'self' https://cloud.umami.is",
  "style-src 'self' https://fonts.googleapis.com",
  "font-src https://fonts.gstatic.com",
  "img-src 'self' data:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

function expectSecurityHeaders(template: Template, environment: Environment): void {
  template.resourceCountIs('AWS::CloudFront::ResponseHeadersPolicy', 1);
  template.hasResourceProperties('AWS::CloudFront::ResponseHeadersPolicy', {
    ResponseHeadersPolicyConfig: Match.objectLike({
      SecurityHeadersConfig: {
        ContentSecurityPolicy: {
          ContentSecurityPolicy: CONTENT_SECURITY_POLICY,
          Override: true,
        },
        ContentTypeOptions: { Override: true },
        FrameOptions: { FrameOption: 'DENY', Override: true },
        ReferrerPolicy: {
          ReferrerPolicy: 'strict-origin-when-cross-origin',
          Override: true,
        },
        StrictTransportSecurity: {
          AccessControlMaxAgeSec: 63072000,
          IncludeSubdomains: true,
          Override: true,
        },
      },
    }),
  });

  const policies = template.findResources('AWS::CloudFront::ResponseHeadersPolicy');
  const policy = Object.values(policies)[0] as {
    Properties: { ResponseHeadersPolicyConfig: { CustomHeadersConfig?: { Items: unknown[] } } };
  };
  const customHeaders = policy.Properties.ResponseHeadersPolicyConfig.CustomHeadersConfig;

  if (environment === 'prod') {
    expect(customHeaders).toBeUndefined();
  } else {
    expect(customHeaders).toEqual({
      Items: [{ Header: 'X-Robots-Tag', Value: 'noindex', Override: true }],
    });
  }

  template.hasResourceProperties('AWS::CloudFront::Distribution', {
    DistributionConfig: Match.objectLike({
      DefaultCacheBehavior: Match.objectLike({
        ResponseHeadersPolicyId: Match.anyValue(),
      }),
    }),
  });
}

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
            ResponseCode: 404,
            ResponsePagePath: '/404.html',
          }),
          Match.objectLike({
            ErrorCode: 403,
            ResponseCode: 404,
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
    template.hasResourceProperties('AWS::CloudFront::Function', {
      FunctionCode: Match.stringLikeRegexp("request\\.uri = uri \\+ 'index\\.html'"),
    });
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
    expectSecurityHeaders(template, 'prod');
  });

  test.each(['dev', 'stage'] as const)('%s distribution sends security headers and noindex', (environment) => {
    const app = new App();
    const stack = new ProfoundBookClubStack(app, `TestStackNoindex-${environment}`, {
      env: envConfig[environment],
      fqdnRoot: envConfig[environment].fqdnRoot,
      bucketName: envConfig[environment].bucketName,
      environment,
    });

    const template = Template.fromStack(stack);

    expectSecurityHeaders(template, environment);
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
