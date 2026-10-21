# Repository agent guidance

Read the repository README and local policy documents before making changes. The GemsForge AI Scrum Team guidance in docs/governance/gemsforge-ai-scrum-team.md is additive; local architecture, workflow, security, hosting, Actions, Projects, and commit conventions remain authoritative.

Work from an issue-numbered branch when required. Preserve unrelated work. Never claim checks or deployment are complete without evidence. Stop after implementation and verification with a delivery report. Merge, deploy, close, Project mutation, secrets, credentials, and destructive cleanup require explicit approval.

Before final verification or handoff, inspect the pull request target branch, fetch its latest remote state, and rebase the issue branch onto that target. Do not assume the target is named `main` or `master`; use the repository and PR configuration. Resolve conflicts, rerun relevant checks, force-push with lease, and verify that the PR head matches the pushed commit.

## PO routing and team awareness

The project POs are distinct but coordinated:

- PO-AL owns GemsForge/aura-logbook-api (Aura Logbook).
- PO-GF owns GemsForge/GemsForgeAPI (GemsForgeAPI).
- PO-PP owns GemsForge/professional-portfolio (ProfessionalPortfolio).

Every PO must identify its own codebase before acting. A request naming one repository, issue, PR, milestone, Project, or branch is local to that repository and should be handled by its owning PO. A request naming all three repositories, the shared Scrum team, shared workflow files, or cross-project policy is a coordinated request for PO-AL, PO-GF, and PO-PP. Do not modify another repository for a local request without routing it to that repository's PO.

For coordinated work, each PO preserves repository-specific configuration while aligning the shared contract, reports its changed files and remote branch, and waits for the other POs where metadata or workflow dependencies cross repository boundaries.

This repository is the source of truth for the GemsForge project portfolio. Use the shared GemsForge Scrum/PO operating model: GitHub is the system of record; issues must state the user outcome, scope, non-goals, acceptance criteria, risks, dependencies, and verification expectations. PO agents may create and prioritize issues, assign work when authorized, maintain project metadata, and comment on PRs. Human approval remains required for merges, releases, privacy-sensitive decisions, destructive migrations, and changes to shared policy.

Preserve this repository's existing stack, workflows, scripts, labels, and documentation. Before proposing work, read the relevant README and project documentation, then inspect `.github/workflows/` and `scripts/`. For issue creation, use `scripts/create-github-story.mjs` and its tests with the repository's `sync-issue-metadata.yml` workflow.
