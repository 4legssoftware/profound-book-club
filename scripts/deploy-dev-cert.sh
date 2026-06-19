#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=aws-cdk-credentials.sh
source "$SCRIPT_DIR/aws-cdk-credentials.sh"

AWS_PROFILE=profound-book-club-dev

load_cdk_aws_credentials

echo "✅ AWS credentials valid. Deploying certificate stack to us-east-1..."
echo "   Validation CNAMEs are added in 4ls-org Terraform (cross-account hosted zone)."

if [ ! -d "node_modules" ]; then
  echo "📦 Installing root dependencies..."
  pnpm install
fi

if [ ! -d "infrastructure/node_modules" ]; then
  echo "📦 Installing infrastructure dependencies..."
  (cd infrastructure && pnpm install)
fi

cd infrastructure
env ENVIRONMENT=dev DEPLOY_CERTS_ONLY=true \
  pnpm exec cdk deploy "ProfoundBookClub-Certificate-dev" --require-approval never

echo ""
echo "✅ Certificate stack deployed."
echo "   Capture validation CNAMEs:"
echo "   aws acm describe-certificate --certificate-arn \$(aws cloudformation describe-stacks \\"
echo "     --stack-name ProfoundBookClub-Certificate-dev --region us-east-1 \\"
echo "     --query 'Stacks[0].Outputs[?OutputKey==\`CertificateArn\`].OutputValue' --output text) \\"
echo "     --region us-east-1 --query 'Certificate.DomainValidationOptions'"
echo ""
echo "   Add CNAMEs to 4ls-org route53-profound-book-club.tf, TFC apply, wait for ISSUED, then:"
echo "   ./scripts/deploy-infrastructure-dev.sh"
echo ""
