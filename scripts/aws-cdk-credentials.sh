#!/bin/bash

# SSO profiles work with the AWS CLI but not always with CDK; export session creds for deploy commands.
load_cdk_aws_credentials() {
  if ! aws sts get-caller-identity --profile "$AWS_PROFILE" &>/dev/null; then
    echo "❌ AWS credentials for profile '$AWS_PROFILE' are expired or invalid."
    exit 1
  fi
  eval "$(aws configure export-credentials --profile "$AWS_PROFILE" --format env)"
  unset AWS_PROFILE
}
