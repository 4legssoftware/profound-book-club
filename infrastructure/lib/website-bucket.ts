import * as cdk from 'aws-cdk-lib';
import { Bucket, BlockPublicAccess, BucketEncryption, ObjectOwnership } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { Environment } from './env-config';

interface WebsiteBucketProps {
  bucketName: string;
  environment: Environment;
}

export class WebsiteBucket extends Construct {
  public readonly bucket: Bucket;

  constructor(scope: Construct, id: string, props: WebsiteBucketProps) {
    super(scope, id);

    const { bucketName, environment } = props;

    this.bucket = new Bucket(this, 'Bucket', {
      bucketName,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
      removalPolicy: environment === 'prod' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: environment !== 'prod',
    });

    cdk.Tags.of(this.bucket).add('4ls:environment', environment);
    cdk.Tags.of(this.bucket).add('4ls:source', 'profound-book-club');
    cdk.Tags.of(this.bucket).add('4ls:application', 'profound-book-club');
    cdk.Tags.of(this.bucket).add('4ls:component', 's3-bucket');
    cdk.Tags.of(this.bucket).add('4ls:owner', 'platform');
    cdk.Tags.of(this.bucket).add('4ls:managed-by', 'cdk');
  }
}
