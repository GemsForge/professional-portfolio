# GemsForge — Agent-Driven Development Workflow

## Purpose

Establish a flexible, agent-driven software development process that allows me to build, test, and refine my applications through iterative prompting while preserving established engineering standards, Git procedures, and quality controls.

The goal is to spend less time managing development tasks and more time designing, evaluating, and improving my applications.

## 1. Development Philosophy

**Formalize what is ready to ship, not every idea being explored.**

Development should support experimentation without requiring a formal GitHub issue, story, or pull request for every modification.

Codex should function as a development partner capable of implementing changes, responding to feedback, reviewing code, and preparing completed work for integration.

I retain final authority over the implementation and merging process.

## 2. Development Modes

### Mode A: Iterative Development

Used for feature development, UI experimentation, refactoring, troubleshooting, and ongoing improvements.

**Workflow:**

Prompt → Build → Test → Review Results → Refine → Repeat

Rules:
- Work within a dedicated development branch.
- Follow existing architecture and coding standards.
- Preserve reusable components and established patterns.
- Accept feedback and implement requested corrections.
- Do not require a new GitHub issue for every iteration.
- Do not automatically create a pull request after every change.
- Continue refining until I approve the implementation for formal delivery.
- Run appropriate tests throughout development.
- Do not merge into protected branches.

### Mode B: Formal Delivery

Used when an implementation is ready for integration.

**Workflow:**

Finalize → Test → Independent Code Review → Resolve Findings → Pull Request → Human Approval → Merge

Rules:
- Follow established GitHub branch and commit policies.
- Run required automated tests and validation checks.
- Perform an independent Codex code review.
- Resolve blocking findings before requesting approval.
- Create or finalize a pull request with implementation details and verification evidence.
- Preserve merge commits rather than squash merging.
- Require my authorization before merging.

Formal delivery must satisfy applicable repository policies, including any required issue linkage.

## 3. Agent Responsibilities

### Iterative Development Agent — New

Responsible for interactive implementation and refinement.

Responsibilities:
- Interpret development prompts.
- Inspect existing architecture before modifying code.
- Implement requested functionality.
- Refine implementations based on feedback.
- Identify opportunities for reuse and simplification.
- Run focused tests.
- Maintain development continuity.
- Prepare completed work for formal review.

The agent should not automatically treat every correction as a new development story.

### Developer Agent — Existing

Responsible for implementing approved requirements and maintaining code quality.

The developer agent must follow repository-specific architecture, coding conventions, branch policies, and testing expectations.

### QA Agent — Existing

Responsible for independently evaluating implementations.

During iterative development, QA may review code without requiring a formal issue.

During formal delivery, QA must verify acceptance criteria, regression risks, accessibility, security, and required checks.

QA must not merge or release changes without authorization.

### Product Owner and Scrum Agents — Existing

Continue managing planned development, project coordination, GitHub Issues, priorities, and formal delivery workflows.

These agents should not impose unnecessary administrative requirements on exploratory development.

## 4. Git and Repository Governance

Existing Git procedures remain authoritative unless explicitly updated.

Core requirements:
- Never commit directly to protected branches.
- Use compliant feature branches.
- Preserve meaningful commit history.
- Prefer merge commits over squash merging.
- Require pull requests for integration.
- Maintain existing branch protections.
- Require human authorization for merges.
- Do not modify repository permissions, secrets, or deployment settings without approval.

## 5. Coding Standards

All agents must preserve established GemsForge architecture and development conventions.

Priorities include:
- Readable, maintainable code.
- Reusable components and utilities.
- Clear separation of responsibilities.
- Minimal unnecessary abstraction.
- Consistent naming conventions.
- Appropriate error handling.
- Type safety.
- Focused testing.
- Documentation of public contracts and non-obvious behavior.

Avoid excessive comments, duplicate functionality, and unnecessary dependencies.

## ⚙️ 6. Configuration status

The current workspace entry point is `AGENTS.md`. It contains the active
iterative-development and formal-delivery rules, agent responsibilities,
verification expectations, and approval boundaries. This document provides the
broader operating model; repository-local `AGENTS.md`, README files, governance
documents, and workflow policies remain authoritative when they are more specific.

When the operating model changes, update the active repository guidance first,
then revise this overview so it does not describe completed work as a future plan.

## 7. Future Automation

A persistent GitHub-based development system may eventually coordinate:

GitHub Backlog → Codex Development → Automated Testing → Independent Review → Pull Request → Human Approval

The initial implementation should prioritize existing ChatGPT and Codex subscription capabilities rather than introducing additional API costs.

Continuous unattended development remains a future enhancement.

## 8. Definition of Success

The development process is successful when:

1. I can describe a feature and have Codex implement it.
2. I can continue refining the implementation through prompts.
3. Every iteration does not require a formal GitHub story.
4. Codex follows established coding and architectural standards.
5. Completed implementations receive appropriate independent review.
6. Pull requests satisfy repository policies.
7. I maintain final control over merging and releasing changes.

**Guiding Principle**

Build freely. Refine deliberately. Review independently. Merge intentionally.
