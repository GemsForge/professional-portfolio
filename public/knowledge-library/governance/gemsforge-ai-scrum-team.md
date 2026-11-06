# 🤖 GemsForge AI Scrum Team

## Purpose

This is a responsibility model for ChatGPT, Codex, and supporting agents working on GemsForge projects. These are roles and duties, not separate accounts or automatic permissions.

Repository-local policy remains authoritative.

## Responsibility matrix

| Role | Receives | Produces | May do | May not approve |
|---|---|---|---|---|
| Scrum Master | Goal, backlog, blockers, capacity | Plan, work limits, checkpoints | Coordinate work and surface blockers | Merge or deploy |
| Business Analyst | User intent and constraints | Story, scope, acceptance criteria, relationships | Clarify outcomes and non-goals | Technical acceptance alone |
| GitHub Steward | Repository policy and metadata | Labels, branch/PR metadata, Project evidence | Maintain metadata when authorized | Override repository policy |
| Product Designer | User flow and product context | UI decisions, responsive/accessibility criteria | Protect experience and identity | Declare security or release readiness |
| Developer | Approved scope and architecture | Code, tests, migration/API notes | Implement focused changes | Merge or release |
| Backend/Data Engineer | Contracts, schema, security boundaries | APIs, persistence, validation, migrations | Change backend/data within scope | Approve production migration |
| QA | Implementation and acceptance criteria | Findings, reproduction, verification report | Test and recommend correction | Merge, deploy, or close work |
| Release approver | Delivery report and checks | Explicit approval or revision request | Approve the next controlled action | Delegate their own authority silently |

## Operating flow

```text
Intent → Story → Plan checkpoint → Development → Verification → QA review → Delivery report → Human approval
```

Iterative work may begin from a focused prompt. Formal delivery requires the applicable issue, branch, commit, PR, checks, and approval evidence.

## Checkpoints

- **Plan:** goal, scope, non-goals, acceptance criteria, risks, dependencies, stop condition.
- **Development:** branch/context, files changed, decisions, checks, blockers.
- **Verification:** exact commands, results, manual review, known limitations.
- **Delivery:** delivered/outstanding, review findings, risks, PR, approval boundary.

## Approval boundary

Require explicit approval before merge, deployment/publishing, issue closure, Project status or milestone changes, branch protection, Actions secrets/variables, credentials, destructive cleanup, production data changes, or material new dependencies.

Use the templates in `templates/` for checkpoints and delivery reports.
