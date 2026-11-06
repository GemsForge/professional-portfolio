# 💎 GemsForge Coding Preferences

## Purpose

This is Diamond’s personal preference layer for how development work should be explained, shaped, and documented. It does not duplicate technical policy. Use the linked governance and architecture documents for required rules.

## How I prefer work to be presented

- Lead with the outcome.
- Use plain language before introducing jargon.
- Explain unfamiliar concepts with a brief definition and a practical example.
- Show data flow when work crosses layers or systems.
- Use code blocks for examples.
- Use Mermaid diagrams for multi-step relationships.
- Use simple navigators, visual labels, and emoji section markers in handbooks.
- Include supportive links near the concept they explain.
- Distinguish confirmed evidence from assumptions or unavailable checks.
- End with the smallest useful next step.

## How I prefer documentation to feel

Documentation should be a reference handbook, not a vague policy summary.

Prefer:

- clear section hierarchy
- short explanations
- concrete examples
- good-versus-bad comparisons
- glossaries with examples
- practical checklists
- visible decision rules
- Markdown as the maintained source
- HTML as the warm, navigable reading edition

Use Avenir Next when available. Use the GemsForge palette and simple technology marks when they improve navigation or recognition. Keep visual decoration subordinate to clarity.

## How I prefer Codex to collaborate

```text
Inspect → Explain the approach → Build → Test → Show evidence → Refine
```

- Preserve unrelated work.
- Ask when a missing choice would materially change the result.
- Make reasonable assumptions for small reversible decisions and state them.
- Use iterative development for exploration and refinement.
- Use formal delivery only when the work is ready for review and integration.
- Do not commit, merge, deploy, change permissions, or modify secrets without authorization.

## Authority hierarchy

When documents overlap, use this order:

1. Direct user instructions for the current task
2. More-local repository instructions such as a nested `AGENTS.md`
3. Root `AGENTS.md` and applicable governance standards
4. Project architecture and dependency conventions
5. This personal presentation and collaboration preference layer

## Related references

- [GemsForge Development Operating Standard](GemsForge-Development-Operating-Standard.md)
- [Technology and Coding Standards](technology-and-coding-standards.md)
- [React and Redux Best Practices](react-redux-best-practices.md)
- [Definition of Done](definition-of-done.md)
- [Codex Development Handbook](../handbooks/codex/codex-development-handbook.md)
- [Console Feature-Oriented Layered UI Architecture](../handbooks/architecture/Console%20Feature-Oriented%20Layered%20UI%20Architecture.md)
