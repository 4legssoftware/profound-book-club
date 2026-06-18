import * as cdk from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { IBucket } from 'aws-cdk-lib/aws-s3';
import {
  Distribution,
  ViewerProtocolPolicy,
  AllowedMethods,
  CachedMethods,
  CachePolicy,
  SecurityPolicyProtocol,
  PriceClass,
  HttpVersion,
  Function as CloudFrontFunction,
  FunctionEventType,
} from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';
import { Environment } from './env-config';

interface CloudFrontDistributionProps {
  environment: Environment;
  websiteBucket: IBucket;
  domainNames?: string[];
  certificate?: ICertificate;
  wwwRedirectFunction?: CloudFrontFunction;
}

export class CloudFrontDistribution extends Construct {
  public readonly distribution: Distribution;

  constructor(scope: Construct, id: string, props: CloudFrontDistributionProps) {
    super(scope, id);

    const { environment, websiteBucket, domainNames, certificate, wwwRedirectFunction } = props;

    const functionAssociations = wwwRedirectFunction
      ? [
          {
            function: wwwRedirectFunction,
            eventType: FunctionEventType.VIEWER_REQUEST,
          },
        ]
      : undefined;

    this.distribution = new Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: CachedMethods.CACHE_GET_HEAD,
        compress: true,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        functionAssociations,
      },
      defaultRootObject: 'index.html',
      domainNames: domainNames && domainNames.length > 0 ? domainNames : undefined,
      certificate,
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/404.html',
          ttl: Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/404.html',
          ttl: Duration.minutes(5),
        },
      ],
      priceClass: PriceClass.PRICE_CLASS_100,
      comment: `profound-book-club ${environment}`,
      enableIpv6: true,
      httpVersion: HttpVersion.HTTP2,
    });

    cdk.Tags.of(this.distribution).add('4ls:environment', environment);
    cdk.Tags.of(this.distribution).add('4ls:source', 'profound-book-club');
    cdk.Tags.of(this.distribution).add('4ls:application', 'profound-book-club');
    cdk.Tags.of(this.distribution).add('4ls:component', 'cloudfront-distribution');
    cdk.Tags.of(this.distribution).add('4ls:owner', 'platform');
    cdk.Tags.of(this.distribution).add('4ls:managed-by', 'cdk');
  }
}
