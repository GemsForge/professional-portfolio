# GemsForgeAPI GitHub Actions templates

These workflow files are copied from the working `.github/workflows/` directory in GemsForgeAPI. They are the reusable policy baseline for future GemsForge repositories.

## What each template protects

| Template | Purpose |
|---|---|
| `branch-policy.yml` | Enforces the branch format, allowed base branches, and PR-to-issue reference. |
| `commit-policy.yml` | Runs the shared commit and proposed squash-subject validator. |
| `console-checks.yml` | Runs Console install, format, lint, test, and production build checks. |
| `database-validation.yml` | Runs Swift API and migration tests against isolated `dev`, `fit`, and `prod` database paths. |
| `label-policy.yml` | Requires a title-compatible story label and matching issue title. |
| `sync-issue-metadata.yml` | Synchronizes issue ownership, labels, milestones, relationships, and lifecycle metadata. |
| `sync-pr-metadata.yml` | Synchronizes pull-request metadata and GemsForge project state. |

## Before reusing a template

1. Confirm the repository's default and protected branches.
2. Replace `Console/`, Swift, and package-specific commands with the repository's actual commands.
3. Review every `paths` filter so a changed file cannot bypass the intended check.
4. Keep read-only permissions for validation jobs.
5. Review `pull_request_target` workflows carefully; they must not check out or execute untrusted fork code.
6. Replace the GemsForge Project number, lifecycle options, and `PROJECTS_TOKEN` assumptions when the repository uses a different Project boundary.
7. Make the stable policy, test, build, and security checks required in branch protection.

The metadata synchronization workflows are not generic drop-ins. Treat them as the GemsForgeAPI adapter for the shared policy, and adapt their repository-specific Project, labels, statuses, and relationship rules deliberately.
