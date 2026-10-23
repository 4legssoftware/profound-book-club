import { Duration } from 'aws-cdk-lib';
import {
  HeadersFrameOption,
  HeadersReferrerPolicy,
  ResponseHeadersPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { Construct } from 'constructs';
import { Environment } from './env-config';

// Semicolon-separated, no trailing semicolon. CloudFront sends this value as Content-Security-Policy.
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

// Two years. Preload is omitted: submitting the domain to the HSTS preload list is hard to undo.
const HSTS_MAX_AGE = Duration.days(730);

export function securityHeadersPolicy(scope: Construct, environment: Environment): ResponseHeadersPolicy {
  return new ResponseHeadersPolicy(scope, 'SecurityHeaders', {
    comment: `profound-book-club ${environment} security headers`,
    securityHeadersBehavior: {
      contentSecurityPolicy: {
        contentSecurityPolicy: CONTENT_SECURITY_POLICY,
        override: true,
      },
      contentTypeOptions: { override: true },
      frameOptions: { frameOption: HeadersFrameOption.DENY, override: true },
      referrerPolicy: {
        referrerPolicy: HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
        override: true,
      },
      strictTransportSecurity: {
        accessControlMaxAge: HSTS_MAX_AGE,
        includeSubdomains: true,
        override: true,
      },
    },
    customHeadersBehavior:
      environment === 'prod'
        ? undefined
        : {
            customHeaders: [{ header: 'X-Robots-Tag', value: 'noindex', override: true }],
          },
  });
}
