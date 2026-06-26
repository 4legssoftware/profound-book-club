---
permissions: ["all"]
---

# Deploy to Dev

Deploy infrastructure and site content to **dev** manually from localhost. Dev is **not** deployed by the GitHub Actions
pipeline (see `docs/e1-website-foundation/website-foundation-summary.md`).

**Custom domain:** `https://dev.profound-book-club.org`

**AWS profile:** `source scripts/pro-dev.sh` (or export `AWS_PROFILE=profound-book-club-dev`). Deploy scripts export SSO
session credentials for CDK automatically via `scripts/aws-cdk-credentials.sh`.

**One-time cert setup** (validation CNAMEs in `4ls-org` Terraform, then):

```bash
./scripts/deploy-dev-cert.sh
# TFC apply in 4ls-org for ACM validation records; wait until cert status ISSUED
./scripts/deploy-infrastructure-dev.sh
# TFC apply in 4ls-org for alias A records → CloudFront
./scripts/deploy-content-dev.sh
```

**Repeat content deploy** after site changes:

```bash
source scripts/pro-dev.sh
./scripts/deploy-content-dev.sh
```

For **4ls-org** Terraform DNS work, use the `4ls-org` repo and its Terraform Cloud workflow — not this command.
