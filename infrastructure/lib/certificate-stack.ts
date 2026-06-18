import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { IHostedZone, HostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';
import { AcmCertificate } from './acm-certificate';
import { Environment, getWwwHostname, hostedZoneName } from './env-config';

interface CertificateStackProps extends StackProps {
  fqdnRoot: string;
  environment: Environment;
  hostedZoneId?: string;
}

export class CertificateStack extends Stack {
  public readonly certificate: AcmCertificate;

  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, {
      ...props,
      env: {
        ...props.env,
        region: 'us-east-1',
      },
    });

    const { fqdnRoot, environment, hostedZoneId } = props;

    cdk.Tags.of(this).add('4ls:environment', environment);
    cdk.Tags.of(this).add('4ls:source', 'profound-book-club');
    cdk.Tags.of(this).add('4ls:application', 'profound-book-club');
    cdk.Tags.of(this).add('4ls:component', 'acm-certificate');
    cdk.Tags.of(this).add('4ls:owner', 'platform');
    cdk.Tags.of(this).add('4ls:managed-by', 'cdk');

    let hostedZone: IHostedZone | undefined;
    if (hostedZoneId && hostedZoneId.trim() !== '') {
      try {
        hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
          hostedZoneId: hostedZoneId.trim(),
          zoneName: hostedZoneName,
        });
      } catch (error) {
        console.warn(
          'Could not reference hosted zone (may be in different account). ' +
            'Certificate will require manual DNS validation. Error:',
          error,
        );
      }
    }

    const cert = new AcmCertificate(this, 'Certificate', {
      domainName: fqdnRoot,
      subjectAlternativeNames: [getWwwHostname(fqdnRoot)],
      hostedZone,
    });

    this.certificate = cert;

    new CfnOutput(this, 'CertificateArn', {
      value: cert.certificate.certificateArn,
      description: `ACM Certificate ARN for ${fqdnRoot}`,
      exportName: `ProfoundBookClub-${environment}-CertificateArn`,
    });
  }
}
