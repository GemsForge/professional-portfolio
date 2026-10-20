# Definition of Done and verification matrix

This supplements README.md, docs/story-and-delivery-workflow.md, and docs/ui-development-workflow.md.

A story is ready for review when acceptance criteria, compliant issue-linked commits, component/hosting/storage boundaries, accessibility and privacy review, applicable checks, and a delivery report are complete.

| Area | Required evidence |
| --- | --- |
| Lint | npm run lint |
| Media | npm run test:media |
| Build | npm run build |
| Feature | Applicable npm run test command |
| Commit/workflow | Commit policy, issue link, workflow label, metadata sync, Actions |
| UX/hosting | Responsive/accessibility and hosted owner-flow review when relevant |
| Storage/security | Owner authorization, upload lifecycle, bindings, no credentials in source |
| Delivery | PR Actions and delivery report |

Record exact blockers; do not claim full verification. Merge and publishing remain separate approvals.
