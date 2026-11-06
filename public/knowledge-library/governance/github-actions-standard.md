# ⚙️ Shared GitHub Actions Standard

Issue: #418

## Purpose

This document defines the shared safety and evidence contract for GitHub Actions. Repository workflows remain the implementation authority; this standard does not replace repository-specific checks.

## ✅ Required workflow behavior

- Validate pull requests before merge.
- Keep policy checks for branch names, commit subjects, issue linkage, labels, and required metadata.
- Make checks deterministic, visible, and documented.
- Require the repository’s required checks before merge.
- Treat deployment, production data, secrets, and Project mutations as separately approved operations.

## ✅ Token permissions

Declare the minimum permissions at workflow or job level. Unspecified permissions should not be assumed.

```yaml
permissions:
  contents: read
```

Increase permissions only for the job that needs them and document why.

```yaml
permissions:
  contents: read

jobs:
  report:
    permissions:
      contents: read
      pull-requests: write # Required only because this job writes a PR report.
```

Never expose secrets to untrusted pull-request code. Review fork behavior before granting write permissions.

## ✅ Action dependencies

Pin actions to a reviewed major/minor version or, for higher assurance, a commit SHA. Review upgrades as dependency changes.

```yaml
- uses: actions/checkout@v6.2.0
# Higher-assurance option:
- uses: actions/checkout@<reviewed-commit-sha>
```

Do not use a moving branch reference such as `@main` for a production-critical workflow without an explicit reason.

## ✅ Trigger safety

Avoid privileged triggers when an ordinary `pull_request` workflow is sufficient. Treat `pull_request_target` and `workflow_run` as privileged contexts; never check out untrusted fork code into a job that has secrets or write permissions.

## Repository adapter

- Preserve the current commit-policy workflow and Swift/Vapor/Fluent and React/TypeScript conventions.
- Keep issue, PR metadata, Project synchronization, and status transitions repository-specific.
- Preserve private-hosting and owner-authentication boundaries.
- GemsForgeAPI’s Project synchronization targets user-owned Project #7 through `PROJECTS_TOKEN`; changes require the existing approval and secret boundaries.

## Change process

Every Actions change must state:

1. Which contract item it implements.
2. Which triggers, permissions, secrets, and external systems it touches.
3. Which checks prove it works.
4. How untrusted pull requests and fork behavior were handled.
5. Whether a human approval is required before merge or execution.

## Review evidence

Record the workflow path, event, permissions, action versions, check result, and any unavailable hosted-run evidence. A passing unrelated workflow does not establish acceptance for the changed workflow.

Supporting references: [workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions), [secure use](https://docs.github.com/en/actions/reference/security/secure-use), and [workflow lockfiles](https://docs.github.com/en/actions/how-tos/administer/enforce-workflow-lockfiles).
