# Shared GitHub Actions Standard

Issue: #67

This repository participates in the GemsForge shared Actions standard. The standard defines the contract; this repository remains the adapter.

## Shared contract

- Validate pull requests before merge.
- Keep policy checks for branch names, commit subjects, issue linkage, labels, and required metadata.
- Pin action major versions intentionally and review upgrades.
- Use least-privilege permissions; never expose secrets to untrusted pull-request code.
- Keep checks deterministic, visible, and documented.
- Require the repository's existing checks to pass before merge.
- Treat deployment, production data, secrets, and project-board mutations as separately approved operations.

## Repository adapter

- Preserve the current Node/React/TypeScript CI checks and the existing main-branch workflow.
- Keep the current branch, label, and issue/PR validation policies.
- Treat any pull_request_target workflow with write permissions as security-sensitive and review it before modification.
- Keep hosting, worker/storage, and owner-authorization checks specific to this repository.

## Change process

Actions changes follow the normal issue → branch → commit → pull request → checks → review flow. Each Actions PR must state which shared contract item it implements, which local checks it touches, and how security was verified.


## Project synchronization

This repository does not introduce a shared Project synchronization workflow. Preserve its existing repository workflow, hosting, and metadata conventions without copying Project identifiers from another repository.

Project changes remain repository-specific and require the existing approval and secret boundaries.
