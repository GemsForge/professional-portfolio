# Definition of Done and verification matrix

This matrix supplements README.md, docs/story-and-delivery-workflow.md, and docs/ui-development-workflow.md. It does not replace local policy.

## Definition of Done

A story is done for review when:

- The story acceptance criteria and delivery checks are satisfied or exceptions are documented.
- The issue-numbered branch and commit/PR title follow repository policy.
- Existing component boundaries, routes, public assets, hosted worker integration, and storage bindings remain intact.
- Accessibility, responsive behavior, owner authorization, draft/publish behavior, and privacy implications were reviewed.
- Applicable automated checks pass.
- A sprint delivery report records evidence, outstanding work, and approval needed.

Merge and publishing remain separate approvals.

## Verification matrix

| Area | Required evidence |
| --- | --- |
| Lint | npm run lint |
| Media behavior | npm run test:media |
| Build | npm run build |
| Feature tests | Applicable npm run test command from the story |
| Commit policy | node --test scripts/commit-policy.test.mjs and PR title/branch checks |
| Workflow | Issue link, workflow label, metadata sync, and required Actions |
| UX | Responsive, keyboard, labels, contrast, and screen-reader semantics reviewed |
| Hosting | Preview or hosted owner-flow verification when deployment behavior changes |
| Storage/security | Owner authorization, upload lifecycle, bindings, and no-credential-in-source review |
| Delivery | PR Actions and delivery report verified |

If a check cannot run, record the exact blocker; do not claim full verification.
