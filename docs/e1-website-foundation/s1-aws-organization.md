**Description**
In `4ls-org`, create a dedicated OU for the Profound Book Club workload and provision `dev`, `stage`, and `prod`
accounts under it with baseline guardrails.

**Acceptance criteria**

- [ ] New OU created under `4ls-org` for profound-book-club

- [ ] `dev`, `stage`, and `prod` accounts created and moved into the OU

- [ ] Baseline SCPs applied (region restriction + guardrails consistent with `4ls-org` conventions)

- [ ] Access verified for each account (IAM Identity Center / SSO roles)

- [ ] Cost allocation tags set per account

**Dependencies:** none (foundational)
**Suggested labels:** `infra`, `aws-org`
