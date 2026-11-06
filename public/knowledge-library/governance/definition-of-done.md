# ✅ Definition of Done and verification matrix

## Purpose

This is the minimum evidence gate for work that is ready for formal review. It does not require every experiment to be merged, and it does not authorize merge, deployment, release, or production data changes.

Repository-local rules, issue acceptance criteria, and explicit user decisions remain authoritative when they are more specific.

## How to use this document

1. Copy the applicable checks into the story or development checkpoint.
2. Mark each check `Pass`, `Fail`, `Blocked`, or `Not applicable`.
3. Record the exact command, file, link, screenshot, or review result as evidence.
4. Do not call work complete when a required check is merely assumed.

## Required completion areas

| Area | ✅ Done means | Evidence to record |
|---|---|---|
| Documentation | Public behavior, decisions, setup, and non-obvious constraints are documented. | Updated source document, link, or intentionally recorded `N/A`. |
| Frontend | Feature behavior, loading, empty, error, permission, responsive, and accessibility states are handled. | Tests, screenshots, browser pass, and changed files. |
| Backend/API | Contracts, validation, authorization, structured errors, cancellation, and status behavior are verified. | API tests, contract examples, and route/service files. |
| Database/migrations | Schema intent, constraints, relationships, indexes, migration order, recovery, and environment impact are reviewed. | Migration, ERD/schema evidence, verification query, and recovery note. |
| Accessibility | Labels, semantics, focus, keyboard use, contrast, announcements, reduced motion, and responsive behavior are checked where applicable. | Automated results plus manual review notes. |
| Security/privacy | Authentication, authorization, ownership, input validation, secrets, logs, private data, and dependency risk are reviewed. | Security test results and explicit limitations. |
| Testing | Focused tests pass, relevant broader checks run, and failures are reported accurately. | Exact commands and results. |
| GitHub issue/branch/PR | Scope, acceptance criteria, labels, branch, commits, PR, and required metadata follow repository policy. | Issue/PR links and policy-check results. |
| QA evidence | An independent review covers acceptance criteria, regression risk, accessibility, security, and changed boundaries. | Review findings, resolutions, or documented blockers. |
| Approval/release boundary | Merge, deployment, release, issue closure, Project changes, and production data actions remain separately approved. | Named approval or explicit “awaiting approval” status. |

## Minimum status vocabulary

- **Pass:** evidence satisfies the check.
- **Fail:** evidence shows the check is not satisfied.
- **Blocked:** the check could not run because of a named external limitation.
- **Not applicable:** explain why the check does not apply.
- **Awaiting approval:** verification is complete, but an authorized person must decide the next action.

## Completion gate

Work is ready for formal review when the requested behavior is implemented, applicable checks have evidence, known risks are documented, and no unresolved blocking finding remains. Formal delivery is complete only after independent review, required checks, human approval, and authorized merge or release.

## Example evidence record

```text
Testing — Pass
Command: npm run test -- Console/src/features/education
Result: 18 passed, 0 failed

Accessibility — Blocked
Manual check: VoiceOver pass could not run because the test device was unavailable.
Follow-up: repeat before formal approval.

Approval — Awaiting approval
PR is ready for review. Merge and deployment have not been authorized.
```

## What this document does not mean

Passing tests do not prove deployment readiness. A merged PR does not prove production release. A completed checkpoint does not authorize external mutation. Each action needs its own evidence and approval boundary.
