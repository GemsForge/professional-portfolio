# ♿ Accessibility and responsive standards

## Purpose

Use this checklist for React, SwiftUI, HTML, and hybrid native/web work. Apply only the checks relevant to the change, but record why a skipped check is not applicable.

Supporting reference: [Web Content Accessibility Guidelines](https://www.w3.org/TR/WCAG22/).

## ✅ Semantic structure

- Use landmarks, ordered headings, lists, buttons, links, labels, descriptions, and tables for their actual purpose.
- Every form control has a visible label or an explicit accessible name.
- Every validation error identifies the affected field and explains recovery.
- Images have meaningful alternative text, or are hidden from assistive technology when decorative.
- Tables have a caption, header cells, and a usable narrow-screen strategy.
- Do not communicate status by color alone.

## ✅ Keyboard and focus

- Every action works without a mouse.
- Tab order follows the reading and task order.
- Focus is visible and does not move unexpectedly.
- Dialogs have an accessible name, focus containment, Escape behavior, and focus restoration.
- Users can skip repeated navigation and reach the main content.
- Custom controls expose the same keyboard behavior as their native equivalent.

## ✅ Dynamic states

Check loading, success, empty, validation, error, retry, disabled, permission, and not-found states when applicable.

- Announce meaningful status changes without stealing focus.
- Keep error text near the relevant control.
- Preserve entered values when recovery is possible.
- Do not make an action appear successful before the server confirms it.
- Respect reduced-motion preferences.

## ✅ Responsive acceptance

Review at the project’s supported compact, tablet, and desktop widths, plus zoomed text or Dynamic Type where applicable.

- Content reflows without unintended horizontal scrolling.
- Long labels, errors, empty states, tables, dialogs, uploads, and previews remain usable.
- Primary actions remain reachable.
- Reading order survives responsive rearrangement.
- Touch targets have adequate size and spacing according to the platform or design-system standard.

## Technology-specific practice

### React

Use semantic JSX, stable labels and IDs, accessible primitives, real links/buttons, and testable loading/error feedback. Verify keyboard flow and accessible names for important paths.

### SwiftUI

Prefer native controls. Support VoiceOver, Dynamic Type, reduced motion, color scheme, orientation, labels, hints, values, traits, and focus behavior when custom views are necessary.

## Evidence required

```text
Automated: command, tool, result
Keyboard: flow tested and result
Screen reader: tool/device, flow, result or blocker
Responsive: viewport(s), flow, result
Contrast/motion: relevant review and result
Known limitation: exact blocker and follow-up
```

Never report “accessible” as a conclusion without recording what was actually checked.
