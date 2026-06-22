#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=aws-cdk-credentials.sh
source "$SCRIPT_DIR/aws-cdk-credentials.sh"

AWS_PROFILE=profound-book-club-stage
STACK_NAME=ProfoundBookClubStack
CERT_STACK_NAME=ProfoundBookClub-Certificate-stage

load_cdk_aws_credentials

echo "✅ AWS credentials are valid. Starting infrastructure deployment..."

if [ -z "${CERTIFICATE_ARN}" ] && [ "${DEPLOY_WITHOUT_CERT:-}" != "1" ]; then
  echo "CERTIFICATE_ARN not set. Attempting to get from $CERT_STACK_NAME (us-east-1)..."
  CERTIFICATE_ARN=$(aws cloudformation describe-stacks \
    --stack-name "$CERT_STACK_NAME" \
    --region us-east-1 \
    --query 'Stacks[0].Outputs[?OutputKey==`CertificateArn`].OutputValue' \
    --output text 2>/dev/null || true)
  if [ -z "${CERTIFICATE_ARN}" ] || [ "${CERTIFICATE_ARN}" == "None" ]; then
    echo "❌ CERTIFICATE_ARN not found. Deploy and validate the cert stack first:"
    echo "   ./scripts/deploy-stage-cert.sh"
    exit 1
  fi
  echo "   Using certificate: ${CERTIFICATE_ARN}"
  export CERTIFICATE_ARN
fi

if [ ! -d "node_modules" ]; then
  echo "📦 Installing root dependencies..."
  pnpm install
fi

if [ ! -d "infrastructure/node_modules" ]; then
  echo "📦 Installing infrastructure dependencies..."
  (cd infrastructure && pnpm install)
fi

echo "🚀 Deploying stack to us-east-2..."
cd infrastructure
echo "🔧 Bootstrapping CDK in us-east-2..."
pnpm exec cdk bootstrap aws://883353268059/us-east-2 --require-approval never

DEPLOY_ARGS=(ENVIRONMENT=stage)
[ -n "${CERTIFICATE_ARN}" ] && DEPLOY_ARGS+=(CERTIFICATE_ARN="$CERTIFICATE_ARN")
env "${DEPLOY_ARGS[@]}" pnpm exec cdk deploy "$STACK_NAME" --require-approval never

echo ""
echo "✅ Infrastructure deployment complete!"
echo ""
if [ -n "${CERTIFICATE_ARN}" ]; then
  echo "🌐 Custom domain (after Route 53 alias records): https://stage.profound-book-club.org"
else
  CF_URL=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" \
    --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' --output text \
    --region us-east-2 2>/dev/null || true)
  [ -n "$CF_URL" ] && echo "🌐 CloudFront URL: $CF_URL"
fi
echo ""
echo "   Stack outputs (for 4ls-org alias records and content deploy):"
aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region us-east-2 \
  --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' --output table 2>/dev/null || true
echo ""
