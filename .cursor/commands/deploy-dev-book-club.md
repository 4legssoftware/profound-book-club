---
permissions: ["all"]
---

# Deploy to Dev

Deploy infrastructure and site content to **dev** manually from localhost. Dev is **not** deployed by the GitHub Actions
pipeline (see `docs/e1-website-foundation/epic-website-foundation.md`).

**Custom domain:** `https://dev.profound-book-club.org`

**1. Infrastructure** (S3, CloudFront, custom domain + cert). Uses `scripts/deploy-infrastructure-dev.sh` once Story 3
scaffold exists. The script should resolve `CERTIFICATE_ARN` from CloudFormation (ACM in us-east-1) or accept an override.

**2. Site content.** Build the static site, sync to the dev bucket, and invalidate CloudFront so the new content is served.

`AWS_PROFILE` is set to **`profound-book-club-dev`** explicitly so a shell default from another project is not used by mistake.

After Story 2/3 land, confirm bucket name, distribution ID, and build script in `package.json` / CDK outputs. Example flow
(modeled on **4ls-site**):

```bash
export AWS_PROFILE=profound-book-club-dev
# export CERTIFICATE_ARN=...  # when lookup is not handled by the deploy script

# Infrastructure
./scripts/deploy-infrastructure-dev.sh

# Site content: build, sync, invalidate (adjust script names and paths to match scaffold)
pnpm run build
aws s3 sync dist/ s3://<dev-bucket-name>/ --delete
aws cloudfront create-invalidation --distribution-id <dev-distribution-id> --paths "/*"
```

For **4ls-org** Terraform DNS work (Story 1 / Story 3), use the `4ls-org` repo and its Terraform Cloud workflow — not this
command.
