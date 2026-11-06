# Portable GitHub development and project-management policies

This package is designed to be copied into any GitHub repository. The policy logic is embedded in the workflow files; there is no required `Scripts/` directory or project-specific helper package.

## Install

Copy these files into the destination repository:

```text
.github/workflows/
├── development-policy.yml
├── commit-policy.yml
├── metadata-sync.yml
└── project-sync.yml
```

Then configure the repository's branch protection to require:

```text
Development policy
Commit policy
```

Add `Metadata sync` and `Project sync` when the repository uses those automations.

## What is portable

- Branch names use `<type>/<issue-number>-<short-description>`.
- Pull requests reference the working issue with `#123`.
- Pull-request titles use `type(scope): #123 short imperative description`.
- The PR title must match the linked issue title.
- Type-compatible labels are required on issues and pull requests.
- Commit subjects are checked inline without an external script.
- Issue labels, assignees, and milestones can be copied to a pull request.
- Optional lifecycle labels can be applied automatically.
- Optional GitHub Project synchronization can use a configured Project ID and token.

## Required adaptation

The workflows do not invent application commands. Add a repository-specific `test-and-build.yml` after identifying the repository's real commands. A Swift repository, a .NET API, and a React application cannot share the same build command safely.

Before enabling the templates:

1. Confirm the default and protected branch names.
2. Review the allowed commit and branch types.
3. Create the type labels used by the policy, or change the mapping.
4. Enable branch-protection requirements only after observing successful runs.
5. Set `PROJECT_ID` and `PROJECTS_TOKEN` only if Project synchronization is wanted.
6. Do not expose secrets to untrusted pull-request code.

## Security boundary

Policy validation uses `pull_request_target` only for reading pull-request and issue metadata. It does not check out or execute pull-request code. Test and build workflows should use `pull_request` and should not receive write-capable secrets.
