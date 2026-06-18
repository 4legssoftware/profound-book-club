import { Stack } from 'aws-cdk-lib';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { IHostedZone } from 'aws-cdk-lib/aws-route53';
import { Construct } from 'constructs';

interface AcmCertificateProps {
  domainName: string;
  subjectAlternativeNames?: string[];
  hostedZone?: IHostedZone;
}

export class AcmCertificate extends Construct {
  public readonly certificate: Certificate;

  constructor(scope: Construct, id: string, props: AcmCertificateProps) {
    super(scope, id);

    const { domainName, subjectAlternativeNames, hostedZone } = props;

    const stack = Stack.of(this);
    if (stack.region !== 'us-east-1') {
      throw new Error(
        `ACM certificates for CloudFront must be in us-east-1, but stack is in ${stack.region}. ` +
          `Please deploy the certificate stack to us-east-1.`,
      );
    }

    this.certificate = new Certificate(this, 'Certificate', {
      domainName,
      subjectAlternativeNames,
      validation: hostedZone
        ? CertificateValidation.fromDns(hostedZone)
        : CertificateValidation.fromDns(),
    });
  }
}
