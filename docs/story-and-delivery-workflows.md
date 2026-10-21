# Story and delivery workflow

Use this guide when creating an issue and implementing it in this repository. Issue titles, PR titles, and commits follow the repository's commit policy. Do not prefix titles with `Story:`.

## Issue title

Use the exact format:

```text
type(scope): #issue-number short imperative description
```

Approved types: `feat`, `fix`, `refactor`, `test`, `chore`.

Approved scopes for non-documentation commits: `ci`, `deps`, `build`. Documentation commits may use any lowercase, hyphenated scope that accurately identifies the documentation area.

Choose the type and scope that best describe the work. `docs` is a commit type, not a scope. GitHub assigns the issue number when the issue is created, so set or correct the title once that number is known. For example:

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
- [ ] [Feature outcome that can be verified]

## Verification
- Automated: [name the exact relevant commands and PR checks]
- Manual: [name the exact browser, accessibility, responsive, or other review]

## Delivery checks
- [ ] Branch follows `<type>/<issue-number>-<short-description>`.
- [ ] Commits and PR title follow `type(scope): #issue-number short imperative description` with approved types and scopes.
- [ ] PR body includes `Closes #issue-number` and the PR has an approved workflow label.
- [ ] CI, commit policy, branch workflow policy, label policy, and metadata sync checks pass.

## Relationships
- Parent: #[parent-issue-number] (omit when this is a top-level story)
- Related: #[related-issue-number] (omit when there are no related stories)
```

Link a parent story when the work belongs under a larger initiative, and link related stories when they share context or dependencies. Use GitHub issue references so the links stay navigable; do not invent a parent when none exists. Apply the labels that best describe the work. Pull requests must have at least one workflow label from: `feature`, `bug`, `documentation`, `maintenance`, `dependencies`, `security`, `refactor`, `testing`, `ci`. The issue's labels, assignees, and milestone are synchronized to its PR by the metadata workflow.

## Verification planning

Every story must name its applicable checks in `## Verification`; “tests pass” by itself is not specific enough. All pull requests run the repository CI commands:

- `npm run lint`
- `npm run test:media`
- `npm run build`

The commit-policy workflow also runs `node --test scripts/commit-policy.test.mjs` and validates branch commits and the proposed PR title. The branch, label, and metadata workflows validate the PR branch/issue link, an allowed workflow label, and copied issue metadata. Include manual checks when the changed behavior needs browser, responsive, accessibility, or hosted-site verification. If a named check cannot be run, report the exact blocker and do not claim full verification.

## Implement the story

1. Before implementation, start from the latest `main`, create and push a branch named `<type>/<issue-number>-<short-description>`, and confirm GitHub links it to the issue. Branch types accepted by the branch check are `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`, and `style`. Do not implement story work on `main`.
2. Read the acceptance criteria and relevant existing code or documentation before changing files. Follow the UI conventions in [`ui-development-workflow.md`](ui-development-workflow.md) for React and TypeScript work.
3. Implement the smallest complete change that satisfies the story. Preserve unrelated working-tree changes and stage only files for the current story.
4. Use the commit title format for every commit:

   ```text
   type(scope): #issue-number short imperative description
   ```

   Keep both type and scope within the approved lists above. Standard Git-generated merge commits are exempt from this check.

5. Open a PR only when authorized. Its title must use the commit-policy format; add a workflow label and include `Closes #issue-number` in the PR body. The branch name must contain that same issue number.
6. Run the exact checks in the story's Verification section and review all PR Actions. Fix failures at their source. Required Actions include CI, commit policy, branch and issue link policy, label policy, and issue/PR metadata sync.
7. Do not close the issue, change its milestone/status, or start another issue unless that action is authorized. Never merge unless the user explicitly instructs you to merge. If asked to merge when checks pass, monitor them and merge when they are green.

## Quick reference

```text
Issue/PR/commit: feat(build): #14 add Hair Log and 75 Hard project cards
Branch:          feat/14-project-cards
PR body:         Closes #14
```

The branch type vocabulary is broader than the commit type vocabulary; commit and PR titles must use the approved commit types and scopes. Work through the authorized story without asking for permission again at every small step. Finish with a concise handoff covering the issue, branch, changed files, checks and results, commit IDs, push/PR state, remaining criteria or blockers, and unrelated working-tree changes. Do not call the story complete while required work remains.
undefined
