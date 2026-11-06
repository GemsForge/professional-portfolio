# 🧭 Development Checkpoint

Use this checkpoint to make the current stopping point visible. It is not a merge or deployment approval.

Product:
Issue/Story:
Branch or working context:
Checkpoint: Plan / Development / Verification / PR
Date:

## Goal

What user outcome is being pursued, and why does it matter?

## Scope

In scope:
-

Out of scope:
-

## Acceptance criteria

- [ ]

## Evidence

- Files changed:
- Commands/checks run:
- Results:
- Manual review:
- PR or artifact link:

## Risks and blockers

- Risk:
- Blocker:
- Missing evidence:

## Decision needed

- [ ] Continue iterative refinement
- [ ] Request independent review
- [ ] Prepare formal delivery
- [ ] Ask the user for direction

## Stop condition

Stop after the listed checks and return the report. Do not merge, deploy, close the issue, mutate Projects, change credentials, or begin another story without explicit approval.

## Completed example

```text
Checkpoint: Verification
Goal: Let users filter the Education table by status.
Acceptance: filter persists while paging; empty and error states remain readable.
Checks: npm test -- EducationTable; npm run typecheck
Result: passed
Decision: request independent review
```
