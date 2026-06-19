import { Stack } from 'aws-cdk-lib';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

interface AcmCertificateProps {
  domainName: string;
  subjectAlternativeNames?: string[];
}

export class AcmCertificate extends Construct {
  public readonly certificate: Certificate;

  constructor(scope: Construct, id: string, props: AcmCertificateProps) {
    super(scope, id);

    const { domainName, subjectAlternativeNames } = props;

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
      validation: CertificateValidation.fromDns(),
    });
  }
}
