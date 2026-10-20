# Run self-hosted Umami and track Production pageviews on the book club site [sc-611]

**Shortcut:** [sc-611](https://app.shortcut.com/4legssoftware/story/611)

**Related epic:** [`e636-site-analytics.md`](./e636-site-analytics.md), Story 2. It covers the on-site half of
[ADR-002](../adrs/adr-002-site-analytics.md). The search side is [sc-637](./s637-search-console-and-sitemap.md). The
ADR's Decision, Consequences, and Revisit triggers sections bound this story.

## Summary

See on-site traffic (visits, referrers, top pages) on profound-book-club.org with self-hosted Umami, without cookies or
a consent banner. This is the site's first always-on backend, and it brings the site's first CSP.

## Acceptance Criteria

- [ ] Umami runs on our own AWS infrastructure, reachable at a first-party subdomain (e.g. stats.profound-book-club.org)
  over HTTPS
- [ ] The Umami tracking script loads on every page in Production, served from that subdomain, and visits appear in the
  Umami dashboard
- [ ] No cookies are set and no consent banner is needed
- [ ] The site's CSP (CloudFront ResponseHeadersPolicy) allows only the Umami subdomain for the script and collection
  endpoint
- [ ] Acceptance/dev traffic does not pollute Production stats (no script outside Production)
- [ ] The Umami PostgreSQL database is backed up automatically, and a restore has been tested once
- [ ] The Umami admin login uses a non-default password, and the default admin account is removed or secured

## Scope

**In**

- Self-hosted Umami (v3, PostgreSQL) on AWS, plus DNS for its subdomain
- Umami script on all Production pages
- A CloudFront ResponseHeadersPolicy with a fonts-aware CSP that allows the Umami subdomain
- `docs/adrs/adr-002-site-analytics.md` committed to the repo

**Out**

- Search Console and sitemap ([sc-637](./s637-search-console-and-sitemap.md))
- Custom events or goals beyond pageviews (the mailing-list signup event belongs to
  [sc-613](../other-features/sc-613-club-announcements.md))
- GA4, PostHog, Plausible, or Umami Cloud
- Broader SEO work

## Related implementation

- **Build once, deploy twice.** `.github/workflows/main.yml` builds `dist/` once and syncs the same artifact to stage
  and then prod. A build-time "prod only" flag would break that, so the Production-only tracker has to be decided at
  runtime (Question 4).
- **No CSP yet.** `infrastructure/lib/cloudfront-distribution.ts` has no `ResponseHeadersPolicy`, and 4ls-site has
  none to copy. `src/layouts/BaseLayout.astro` loads Google Fonts (`fonts.googleapis.com` for CSS and
  `fonts.gstatic.com` for font files). It also has two inline JSON-LD blocks, but browsers don't execute
  `application/ld+json`, so `script-src` doesn't affect them. Astro may inline small stylesheets, which affects
  `style-src` (Question 5).
- **Deploy role permissions.** The `cdk-deploy-policy` in `4ls-org/.../profound-book-club-github-oidc.tf` already covers
  `ec2`, `ecs`, `rds`, `elasticloadbalancing`, `ssm`, `secretsmanager`, `s3`, `logs`, `acm`, and `cloudfront`. It does
  **not** cover `backup:*`, `dlm:*`, or `lightsail:*`. Choosing any of those needs a 4ls-org change first.
- **CDK app shape.** `infrastructure/bin/profound-book-club.ts` builds either `CertificateStack` (us-east-1, with
  `DEPLOY_CERTS_ONLY=true`) or `ProfoundBookClubStack`, based on `ENVIRONMENT`. An analytics stack fits as a third
  stack, created only for `prod`.
- **DNS.** The stats subdomain record goes in `4ls-org/infrastructure/modules/common/route53-profound-book-club.tf`,
  next to the existing records for each environment.
- **Umami v3 facts.**
  - It requires PostgreSQL.
  - It ships with a default `admin` / `umami` login.
  - It serves the tracker at `/script.js` and collects at `/api/send`. Both paths can be renamed with environment
    variables.
  - The tracker's `data-domains` attribute stops it from recording on hostnames that aren't listed.

## Questions

Resolve these one at a time at kickoff, in this order. Each recommendation is a starting point.

1. **Hosting shape.** ADR-002 leaves this to kickoff, with a revisit trigger at about $9/mo.
   - **(a) Recommended:** one small Graviton EC2 instance (about 1 GB of RAM, e.g. `t4g.micro`) running Umami and
     PostgreSQL with Docker Compose. Data lives on an encrypted gp3 EBS volume, and secrets come from SSM SecureString
     parameters. Roughly $10/mo including the public IPv4 charge, which is right at the trigger. The current deploy
     role already covers it.
   - (b) ECS Fargate, RDS, and an ALB. Managed patching and backups, but roughly $35+/mo, which crosses the trigger on
     day one.
   - (c) Lightsail. The cheapest flat price, but CDK support is weak and the deploy role would need `lightsail:*`.
2. **Pipeline home.**
   - **(a) Recommended:** a separate `ProfoundBookClubAnalyticsStack` created only for `prod`, deployed manually from
     localhost with `scripts/deploy-analytics-prod.sh`, the same way dev is deployed. The `cdk-test` job still runs its
     tests on every push. There's no stage copy to pay for, and a routine push can't replace the instance.
   - (b) The pipeline deploys the analytics stack to prod only, after the stage site steps pass. That's more automated,
     but every push carries risk to the instance, so the data volume would need a retain policy.
   - (c) Deploy it to stage and prod both. That doubles the cost and the upkeep.
3. **HTTPS for `stats.profound-book-club.org`.**
   - **(a) Recommended:** Caddy on the instance with automatic Let's Encrypt certificates. Terraform adds an A record
     pointing at an Elastic IP. The security group opens only ports 80 and 443, and admin access goes through SSM
     Session Manager, with no SSH.
   - (b) CloudFront in front with an ACM certificate, following the `CertificateStack` pattern. This adds the
     cert-then-DNS handoff between repos, and the CloudFront-to-instance hop needs HTTPS or a VPC origin to keep the
     admin login encrypted.
4. **Production-only tracking with one build artifact.**
   - **(a) Recommended:** a same-origin `public/analytics.js` loader that injects the Umami script only when
     `location.hostname === 'profound-book-club.org'`, with `data-domains` as a second guard. The tracker never loads
     outside Production.
   - (b) Use `data-domains` alone. The script still loads on stage, which doesn't meet the criterion as written.
5. **CSP shape.**
   - (a) **Recommended:** CDK `ResponseHeadersPolicy` on the site distribution with these directives:
     - `default-src 'self'`
     - `script-src 'self' https://stats.profound-book-club.org`
     - `connect-src 'self' https://stats.profound-book-club.org`
     - `style-src 'self' https://fonts.googleapis.com`
     - `font-src https://fonts.gstatic.com`
     - `img-src 'self' data:`
     - `frame-ancestors 'none'`
     - `base-uri 'self'`
     - `form-action 'self'`

     Set `build.inlineStylesheets: 'never'` in Astro so `style-src` doesn't need `'unsafe-inline'`. Include the
     standard security headers in the same policy (HSTS, `nosniff`, `Referrer-Policy`, frame options).
   - (b) Ship it as `Content-Security-Policy-Report-Only` first, then enforce it in a follow-up commit once the
     console is clean on stage.
   - (c) Check whether Astro's built-in CSP support (hash-based `<meta>`) suits a static build better than a
     CloudFront header.

## Implementation Checklist

The checklist assumes the recommended answers to Questions 1–5. Update it once those questions are resolved.

### Segment 1: Analytics stack tests and skeleton (`profound-book-club`, CDK)

- [ ] Write `infrastructure/test/analytics-stack.test.ts` first. It covers:
  - a snapshot of the stack
  - IMDSv2 required
  - encrypted EBS volumes
  - security group ingress limited to ports 80 and 443, with no port 22
  - an instance role with `AmazonSSMManagedInstanceCore`
  - a backup bucket that is private, encrypted, and versioned, with a lifecycle rule
  - `RemovalPolicy.RETAIN` on stateful resources
- [ ] Add `infrastructure/lib/analytics-stack.ts` and helper constructs:
  - VPC: default VPC lookup, or a minimal public-subnet VPC
  - an Elastic IP
  - the instance with user data that installs Docker Compose and Caddy
  - SSM parameters for `APP_SECRET` and the database password
- [ ] In `bin/profound-book-club.ts`, create the stack only when `ENVIRONMENT=prod`, and output the Elastic IP
- [ ] Add `scripts/deploy-analytics-prod.sh`, following the shape of `deploy-infrastructure-dev.sh`
- [ ] `pnpm run test` and `pnpm cdk synth` pass for dev, stage, and prod. Stage and dev synth must not include the
  analytics stack. **Stop and review the synth output**
- [ ] Commit and push to `main`: `[sc-611] Add the analytics stack for self-hosted Umami`. The pipeline does not
  deploy this stack
- [ ] Pipeline is green (the `cdk-test` job covers the new tests) before starting Segment 2

### Segment 2: Bring up Umami at stats.profound-book-club.org (`profound-book-club` deploy, then `4ls-org` DNS)

- [ ] Deploy the analytics stack to prod from localhost and **stop for review** of the change set
- [ ] Add an `A` record for `stats.profound-book-club.org` pointing at the Elastic IP to `route53-profound-book-club.tf`
- [ ] Check the TFC plan (one record), then commit and push to `main` in `4ls-org`:
  `[sc-611] Point stats.profound-book-club.org at the Umami instance`
- [ ] Caddy obtains a certificate. `https://stats.profound-book-club.org/api/heartbeat` returns 200, and `/script.js`
  returns 200
- [ ] On first login, replace the default `admin` / `umami` credentials: change the password, and rename or replace the
  admin user. Store the credentials in 1Password
- [ ] Create the `profound-book-club.org` website in Umami and record its website ID here. The ID is public, not a
  secret
- [ ] If the deploy needed fixes in `profound-book-club`, commit and push them as `[sc-611] …` and wait for the pipeline
  to go green

### Segment 3: Automated backups and a restore drill (`profound-book-club`, CDK and instance config)

- [ ] Extend the tests first: the instance role can write only to the backup bucket's prefix
- [ ] Add a nightly `pg_dump` (a systemd timer in the user data) that uploads to the backup bucket, with about 30 days of
  lifecycle retention
- [ ] Deploy to prod from localhost, then trigger a backup by hand and confirm the object appears in S3
- [ ] Restore drill: load the latest dump into a scratch PostgreSQL container, confirm the website and pageview tables
  have rows, and record the date and result here
- [ ] Add a short restore runbook under `docs/` (kebab-case file name)
- [ ] `pnpm run test` and `pnpm cdk synth` pass
- [ ] Commit and push to `main`: `[sc-611] Back up the Umami database nightly to S3`
- [ ] Pipeline is green before starting Segment 4

### Segment 4: Site CSP and security headers (`profound-book-club`, CDK and Astro config)

- [ ] Extend `profound-book-club-stack.test.ts` first. Assert that the distribution's default behavior has a
  `ResponseHeadersPolicy` and that:
  - `script-src` and `connect-src` allow `'self'` and the stats origin, and nothing else
  - `font-src` and `style-src` allow the Google Fonts origins
  - HSTS and `nosniff` are present
- [ ] Add `infrastructure/lib/security-headers-policy.ts` and attach it in `cloudfront-distribution.ts`
- [ ] Set `build.inlineStylesheets: 'never'` in `astro.config.mjs`, or whatever Question 5 settles on
- [ ] Deploy dev from localhost and check `/`, `/conversations`, and `/404`: fonts and styles load, and the browser
  console shows no CSP violations
- [ ] Lint, check, format, build, `pnpm run test`, and `pnpm cdk synth` pass
- [ ] Commit and push to `main`: `[sc-611] Add a CSP and security headers to the site distribution`
- [ ] Pipeline is green, and a manual check of the stage and prod consoles shows no CSP violations, before starting
  Segment 5

### Segment 5: Track Production pageviews (`profound-book-club`, site)

- [ ] Extend the smoke tests first: every page references `/analytics.js`, and `/analytics.js` returns 200
- [ ] Add `public/analytics.js`, which injects `https://stats.profound-book-club.org/script.js` with `data-website-id`
  and `data-domains="profound-book-club.org"`, only on the apex hostname
- [ ] Reference the loader from `BaseLayout.astro` with `defer`
- [ ] Lint, check, format, and build pass
- [ ] Deploy dev from localhost and confirm in DevTools that dev never requests the stats origin
- [ ] Commit and push to `main`: `[sc-611] Track Production pageviews with Umami`
- [ ] Pipeline is green, then verify:
  - stage makes no requests to the stats origin
  - prod loads the script under the CSP with no violations
  - a visit shows up in the Umami dashboard
  - no cookies are set on prod (DevTools > Application > Cookies)

### Segment 6: Record the hosting decision (docs only)

- [ ] Record the answers to Questions 1–5 here. If they differ significantly from ADR-002, add a follow-up ADR under
  `docs/adrs/`
- [ ] Update ADR-002 status from **Proposed** to **Accepted**, and note the actual monthly cost after the first bill
- [ ] Commit and push to `main`: `[sc-611] [skip ci] Record the Umami hosting decision`

### Final

- [ ] Verification: the last segment's pipeline run is green; CDK tests and synth passed for both stacks; the 4ls-org
  TFC plan was clean; the site build passed
- [ ] Coverage: the analytics stack has a snapshot plus assertions on IMDSv2, encryption, ingress, retain policies, and
  backup bucket access. The site stack has assertions on the security headers policy
- [ ] Long files: review any non-test file over 200 lines, especially `analytics-stack.ts`, the user-data script, and
  `smoke-test.cjs`. If one needs splitting, do it as its own segment: commit, push, and wait for the pipeline
- [ ] Check every acceptance criterion against what is live in prod, and record the date of the first week of data
- [ ] See the `story-kickoff` skill for the evaluation and refactor steps of the story lifecycle

## Notes

- Not driven by a data-entry or display screen; it's site infrastructure/observability.
- Revisit triggers are in the ADR (running cost above about $9/mo, upgrade or backup trouble, a second site wanting
  analytics). Plausible and Umami Cloud are the fallbacks.
- sc-613 extends the CSP from Segment 4 with a `form-action` entry for Buttondown. It also adds an Umami signup event.
