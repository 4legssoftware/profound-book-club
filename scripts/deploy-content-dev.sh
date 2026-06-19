#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=aws-cdk-credentials.sh
source "$SCRIPT_DIR/aws-cdk-credentials.sh"

AWS_PROFILE=profound-book-club-dev
STACK_NAME=ProfoundBookClubStack
REGION=us-east-2

load_cdk_aws_credentials

BUCKET=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" \
  --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' --output text)
DIST_ID=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" \
  --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' --output text)

if [ -z "$BUCKET" ] || [ "$BUCKET" == "None" ]; then
  echo "❌ BucketName not found on stack $STACK_NAME. Deploy infrastructure first."
  exit 1
fi

echo "✅ Deploying site content to s3://$BUCKET/ ..."
pnpm run build
aws s3 sync dist/ "s3://${BUCKET}/" --delete

if [ -n "$DIST_ID" ] && [ "$DIST_ID" != "None" ]; then
  echo "🔄 Invalidating CloudFront cache ($DIST_ID)..."
  aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths '/*' \
    --query 'Invalidation.{Id:Id,Status:Status}' --output table
fi

echo ""
echo "✅ Content deploy complete."
WEBSITE_URL=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" \
  --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' --output text 2>/dev/null || true)
[ -n "$WEBSITE_URL" ] && echo "   URL: $WEBSITE_URL"
echo ""
