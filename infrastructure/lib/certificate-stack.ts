import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AcmCertificate } from './acm-certificate';
import { Environment, getWwwHostname } from './env-config';

interface CertificateStackProps extends StackProps {
  fqdnRoot: string;
  environment: Environment;
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

    const { fqdnRoot, environment } = props;

    cdk.Tags.of(this).add('4ls:environment', environment);
    cdk.Tags.of(this).add('4ls:source', 'profound-book-club');
    cdk.Tags.of(this).add('4ls:application', 'profound-book-club');
    cdk.Tags.of(this).add('4ls:component', 'acm-certificate');
    cdk.Tags.of(this).add('4ls:owner', 'platform');
    cdk.Tags.of(this).add('4ls:managed-by', 'cdk');

    const cert = new AcmCertificate(this, 'Certificate', {
      domainName: fqdnRoot,
      subjectAlternativeNames: [getWwwHostname(fqdnRoot)],
    });

    this.certificate = cert;

    new CfnOutput(this, 'CertificateArn', {
      value: cert.certificate.certificateArn,
      description: `ACM Certificate ARN for ${fqdnRoot}`,
      exportName: `ProfoundBookClub-${environment}-CertificateArn`,
    });
  }
}
