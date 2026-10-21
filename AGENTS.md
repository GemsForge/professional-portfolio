# Repository agent guidance

Read the repository README and local policy documents before making changes. The GemsForge AI Scrum Team guidance in docs/governance/gemsforge-ai-scrum-team.md is additive; local architecture, workflow, security, hosting, Actions, Projects, and commit conventions remain authoritative.

Work from an issue-numbered branch when required. Preserve unrelated work. Never claim checks or deployment are complete without evidence. Stop after implementation and verification with a delivery report. Merge, deploy, close, Project mutation, secrets, credentials, and destructive cleanup require explicit approval.

Code documentation rule: every code change must include an appropriate
documentation comment for the changed behavior or public contract. Use focused
comments for implementation logic, JSDoc/TSDoc for JavaScript or TypeScript
APIs and reusable components, and XML documentation comments for C#/.NET or
other XML-documentation-supported APIs. Keep comments accurate and explain
intent, invariants, inputs, outputs, or constraints; do not add empty comments
solely to satisfy this rule. Review and update nearby comments when a change
makes them stale.

Automation coordination: the active Scrum Master automation is the shared
coordinator for Aura Logbook, GemsForgeAPI, and Professional Portfolio. It is
attached to the shared SCRUM TEAM project and covers all three repository
working directories. Do not create duplicate per-project automations that
could work the same stories concurrently.

This repository is the source of truth for the GemsForge project portfolio. Use the shared GemsForge Scrum/PO operating model: GitHub is the system of record; issues must state the user outcome, scope, non-goals, acceptance criteria, risks, dependencies, and verification expectations. PO agents may create and prioritize issues, assign work when authorized, maintain project metadata, and comment on PRs. Human approval remains required for merges, releases, privacy-sensitive decisions, destructive migrations, and changes to shared policy.

Preserve this repository's existing stack, workflows, scripts, labels, and documentation. Before proposing work, read the relevant README and project documentation, then inspect `.github/workflows/` and `scripts/`. For issue creation, use `scripts/create-github-story.mjs` and its tests with the repository's `sync-issue-metadata.yml` workflow.

Lifecycle gate: when a PR is created, the linked issue and PR move to `QA` for internal Codex Review. An approved Codex Review moves them to `In review` for the human PR decision. A merged PR moves them to `Merged` and closes the linked story; the resulting closed story becomes `Done`. Required corrections use `Changes requested`; QA does not merge or release.

Exact developer references: `README.md`; `docs/ui-development-workflow.md`; `docs/governance/`; `app/`; `components/`; `hooks/`; `lib/`; `tests/`; `scripts/`; `.github/workflows/`; and `.github/agents/`.

Developer handoff rule: after modifying code, run the narrowest relevant verification, create one focused policy-compliant commit, and push it to the remote issue branch before reporting the work complete. Do not leave completed implementation only in the local working tree.

Before reporting the push, verify the remote branch head and the associated PR state. Confirm the pushed commit is the PR head and that the PR is still open; a commit pushed after merge, to another branch, or to a closed PR is not a completed handoff and must be reported as a blocker.

## Technology guidance

Use `docs/ui-development-workflow.md`, the README, and the relevant application, component, hook, library, test, and worker files for this repository's React/TypeScript UI and hosted-worker/storage boundaries. Keep temporary UI state, reusable hooks, server data, accessibility, responsive behavior, and tests in their documented layers. This repository does not use Aura's C#/.NET/Redux conventions or GemsForgeAPI's Swift/Vapor conventions; do not import those patterns without an explicit architectural decision.

## Shared agent target contract

All three project teams use the same agent-facing file contract. Target the
repository-local copies of these files when the request is shared policy or
workflow work:

- `AGENTS.md` for routing, handoff, commit/push, rebase, and QA rules.
- `Scripts/create-github-story.mjs` and `Scripts/create-github-story.test.mjs`
  for issue/story creation.
- `Scripts/commit-policy.mjs`, `Scripts/commit-policy.json`, and their tests
  for focused commit subjects.
- `.github/workflows/branch-policy.yml` for branch and base-branch policy.
- `.github/workflows/commit-policy.yml` for commit and PR-title policy.
- `.github/workflows/label-policy.yml` for required labels.
- `.github/workflows/sync-issue-metadata.yml` for issue metadata and Project
  synchronization.
- `.github/workflows/sync-pr-metadata.yml` for PR metadata synchronization.
- `.github/agents/*.agent.md` for the PO, developer, Scrum Master, and QA
  operating instructions.
- `docs/governance/gemsforge-ai-scrum-team.md`,
  `docs/governance/github-actions-standard.md`, and the technology,
  accessibility, definition-of-done, and workflow documents for the shared
  process contract.

Preserve this repository's `Scripts/` casing and repository-specific project,
milestone, label, base-branch, and technology values. A cross-repository
request updates the equivalent file in each repository; a project-local
request updates only this repository.
