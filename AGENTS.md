# Repository agent guidance

Read the repository README and local policy documents before making changes. The GemsForge AI Scrum Team guidance in docs/governance/gemsforge-ai-scrum-team.md is additive; local architecture, workflow, security, hosting, Actions, Projects, and commit conventions remain authoritative.

Work from an issue-numbered branch when required. Preserve unrelated work. Never claim checks or deployment are complete without evidence. Stop after implementation and verification with a delivery report. Merge, deploy, close, Project mutation, secrets, credentials, and destructive cleanup require explicit approval.

This repository is the source of truth for the GemsForge project portfolio. Use the shared GemsForge Scrum/PO operating model: GitHub is the system of record; issues must state the user outcome, scope, non-goals, acceptance criteria, risks, dependencies, and verification expectations. PO agents may create and prioritize issues, assign work when authorized, maintain project metadata, and comment on PRs. Human approval remains required for merges, releases, privacy-sensitive decisions, destructive migrations, and changes to shared policy.

Preserve this repository's existing stack, workflows, scripts, labels, and documentation. Before proposing work, read the relevant README and project documentation, then inspect `.github/workflows/` and `scripts/`. For issue creation, use `scripts/create-github-story.mjs` and its tests with the repository's `sync-issue-metadata.yml` workflow.

QA gate: PR checks validate the proposed change before merge. After merge to `main`, QA validates the merged development branch against the story's acceptance criteria, regression, accessibility, responsive behavior, security/privacy expectations, and required evidence. QA may set Project status to `QA` and recommend release or corrective work; QA does not merge, release, or close the story.
