# Subagent workflow

Subagents may accelerate independent research, implementation, or verification, but the named role remains accountable for synthesis, issue updates, decisions, and handoffs.

Use the repository aliases: PO-PP, SM-PP, UX-PP, DEV-PP, and QA-PP. Delegate independent research, design exploration, implementation tracks, or verification checks only when the work can be safely separated. Keep scope, acceptance criteria, coordination, experience decisions, fixes, and final QA approval with the named role.

Subagents report to their spawning role. They may not merge, release, close issues, change Projects, alter secrets, or approve their own work. The sequence remains: PO defines, SM decomposes, UX and DEV may parallelize, QA verifies, and explicit QA approval is required before merge consideration.

## Scrum delivery loop

| Stage | Owner | Required action | Handoff condition |
| --- | --- | --- | --- |
| Ready for development | SM-PP | Confirm scope, metadata, branch, and dependencies | DEV-PP may begin |
| Implementation | DEV-PP | Implement, verify, commit, push, and update the issue/PR | QA-PP receives the work |
| QA review | QA-PP | Test acceptance criteria, responsive behavior, accessibility, and regression risk; record evidence and remarks | Approval or findings recorded |
| Bug writing | PO-PP or SM-PP | Write and link a bug story with reproduction, expected/actual behavior, severity, owner, and evidence | DEV-PP receives a linked fix |
| Fix cycle | DEV-PP | Address QA remarks, record the fix commit and verification, and return the work to QA-PP | QA-PP rechecks |
| Merge eligibility | QA-PP | Record explicit approval after all criteria pass | Work is eligible for merge; no additional human merge approval is required for now |

### Example

QA-PP finds that a portfolio project link has insufficient focus visibility at
mobile width. QA-PP records the viewport, keyboard steps, expected focus state,
and evidence. PO-PP writes the linked accessibility bug and assigns DEV-PP.
DEV-PP fixes the focus styling, records the commit and browser verification, and
returns the work to QA-PP. QA-PP rechecks the link and records approval when the
criterion passes.
