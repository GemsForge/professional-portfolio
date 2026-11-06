# 🌿 Commit Policy and Automated Git Procedures

## Page 1: 🧭 Why commit policy matters

Commit policy is common in enterprise development because large teams need a predictable record of change. The same practice helps smaller teams, open-source projects, and agent-assisted development.

Consistent commits make it easier to understand what changed, connect work to an issue, filter history by area, generate release notes, and find the right change during troubleshooting. When multiple people or agents work in the same project, the policy provides a shared language for handoffs.

> 💡 **Key idea:** A commit subject should explain the change before anyone opens the diff.

For example, `test(ui): #205 verify heading semantics and variants` tells a reviewer the change type, area, issue, and purpose immediately.

## Page 2: 📝 Commit format

Use this format:

```text
type(scope): #issue short imperative description
```

Use a repository-approved type such as `feat`, `fix`, `refactor`, `test`, `docs`, or `chore`. Keep the scope lowercase, include a positive issue number, and begin the description with a lowercase imperative verb.

### ✅ Do and 🚫 Don’t

| ✅ Do | 🚫 Don’t |
| --- | --- |
| `feat(ui): #205 add shared heading component` | `added heading stuff` |
| `test(ui): #205 verify heading semantics and variants` | `tests` |
| `docs(architecture): #205 explain presentation-focused components` | `update docs` |
| Use a lowercase scope such as `ui` or `architecture`. | Use vague scopes such as `misc` or `stuff`. |
| Begin with `add`, `verify`, or `explain`. | Begin with `added` or `fixed`. |
| Keep related work independently reviewable. | Combine unrelated work into one opaque commit. |

## Page 3: 🌱 Branches and focused commits

Formal work uses a focused issue-numbered branch. Exploratory work may remain local until formal delivery is requested.

```text
fix/205-live-metadata-migration
feat/418-shared-actions-standard
docs/500-development-handbook
```

Use focused commits for independently reviewable parts such as contracts, implementation, integrations, tests, and documentation. A shared component change might use:

```text
feat(ui): #205 add shared heading component
test(ui): #205 verify heading semantics and variants
docs(architecture): #205 explain presentation-focused components
```

An anecdote makes the value practical: when an agent hands work to another agent, a commit titled `test(ui): #205 verify heading semantics and variants` gives the next contributor an immediate map of the work. The handoff starts with intent, and the diff supplies the evidence.

## Page 4: 🤖 Applying policy automatically

Automation turns the written policy into a repeatable Git procedure. Use fast local checks for immediate feedback and a required CI check for the shared repository decision.

### Local validation

Run the same checks before committing and before pushing:

```sh
# Confirm the branch follows the repository pattern.
branch=$(git branch --show-current)
case "$branch" in
  feat/*|fix/*|refactor/*|test/*|docs/*|chore/*) printf 'Branch format accepted: %s\n' "$branch" ;;
  *) printf 'Invalid branch format: %s\n' "$branch" >&2; exit 1 ;;
esac

# Review the staged change before committing.
git diff --cached --check
git diff --cached --stat

# Create a policy-compliant commit.
git commit -m "feat(ui): #205 add shared heading component"
```

A repository hook can run the subject validator and staged-diff checks automatically. Keep the hook small, fast, and committed with the repository’s development tooling so every contributor can install the same rule.

💡 **Learning note:** I did not know this shell `case` syntax existed. It provides a readable way to compare a branch name against several accepted patterns and stop immediately when the branch is invalid.

### CI validation

For a Node-based repository, the pull-request workflow should set up the runtime, install dependencies, and validate the branch, commit subjects, issue linkage, required labels, and focused tests:

```yaml
name: Policy checks

on:
  pull_request:

jobs:
  policy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - name: Install dependencies
        run: npm ci
      - name: Validate branch and commit policy
        run: npm run policy:check
      - name: Run focused component checks
        run: npm run test:components
```

The repository-specific `policy:check` command owns the exact regular expressions, allowed types, issue-number rules, and pull-request metadata. The workflow should report a clear failure message that points to the matching policy example.

For a reusable implementation pattern, see the [portable GitHub development workflow guidance](../../governance/templates/ci/portable-github-development/README.md).

## Page 5: 🚦 Safe delivery sequence

1. Create the issue-numbered branch.
2. Make a focused change.
3. Run local policy and focused tests.
4. Create a policy-compliant commit.
5. Push the branch and open the linked pull request.
6. Wait for required checks and independent review.
7. Merge only after human approval.

> 🔒 **Automation boundary:** Automation enforces the rule; it does not grant merge, acceptance, release, or deployment authority.

## References

- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- [commitlint](https://commitlint.js.org/)
- [Git hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks)
- [GitHub: About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub: About pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)
