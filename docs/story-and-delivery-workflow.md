# Story and delivery workflow

Use this guide when creating an issue and implementing it in this repository. Issue titles, PR titles, and commits follow the repository's commit policy. Do not prefix titles with `Story:`.

## Issue title

Use the exact format:

```text
type(scope): #issue-number short imperative description
```

Approved types: `feat`, `fix`, `refactor`, `test`, `chore`.

Approved scopes: `docs`, `ci`, `deps`, `build`.

Choose the type and scope that best describe the work. GitHub assigns the issue number when the issue is created, so set or correct the title once that number is known. For example:

```text
feat(build): #14 add Hair Log and 75 Hard project cards
```

## Story body

Write the issue body in this structure. Keep the story focused on the user value and make acceptance criteria concrete and verifiable.

```markdown
## Story
As a [user], I want [capability] so that [benefit].

## Outcome
[Describe the expected result.]

## Acceptance criteria
- [ ] [Observable requirement]
- [ ] [Accessibility, responsive, or behavior requirement when relevant]
- [ ] [Verification requirement]
```

Apply the labels that best describe the work. Pull requests must have at least one workflow label from: `feature`, `bug`, `documentation`, `maintenance`, `dependencies`, `security`, `refactor`, `testing`, `ci`. The issue's labels, assignees, and milestone are synchronized to its PR by the metadata workflow.

## Implement the story

1. Start from the latest `main` and create a branch named `<type>/<issue-number>-<short-description>`, for example `feat/14-project-cards` or `docs/14-story-workflow`. Branch types accepted by the branch check are `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`, and `style`.
2. Read the acceptance criteria and relevant existing code or documentation before changing files. Follow the UI conventions in [`ui-development-workflow.md`](ui-development-workflow.md) for React and TypeScript work.
3. Implement the smallest complete change that satisfies the story. Preserve unrelated working-tree changes.
4. Use the commit title format for every commit:

   ```text
   type(scope): #issue-number short imperative description
   ```

   Keep both type and scope within the approved lists above. Standard Git-generated merge commits are exempt from this check.

5. Open a PR with the same commit-policy format for its title, add a workflow label, and include `Closes #issue-number` in the PR body. The branch name must contain the same issue number.
6. Review the checks and fix failures at their source. Required Actions include CI, commit policy, branch and issue link policy, label policy, and issue/PR metadata sync.
7. Merge only when the required checks pass and the user has asked for the PR to be merged. If the user says to merge once checks pass, monitor the checks and merge when they are green.

## Quick reference

```text
Issue/PR/commit: feat(build): #14 add Hair Log and 75 Hard project cards
Branch:          feat/14-project-cards
PR body:         Closes #14
```

The branch type vocabulary is broader than the commit type vocabulary; commit and PR titles must use the approved commit types and scopes.
