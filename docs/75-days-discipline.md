# 75 Days of Discipline

## Purpose

75 Days of Discipline is a 75 Soft-style accountability challenge focused on consistency over perfection. It is designed to build the habits and follow-through needed to prepare for the Murph Challenge.

Habitica provides the social accountability layer. Apple Shortcuts and Notion preserve the structured personal record.

## Daily challenge rules

- **Disciplined Day:** Make intentional choices and honor the day’s commitments.
- **Exercise:** Complete at least 30 minutes of purposeful movement.
- **Hydration:** Choose one of the available markers: **0, 40, 60, 70, or 80 fl oz**.
- **Mindful Content:** Choose from `Read 2 pages`, `Prayer ☀️`, `Prayer 🌙`, `Mindful content`, or `Did not make time 🚫`.

Reflections, encouraging friends, and streak celebrations are optional but encouraged. Missing a day is a reason to reflect, reset, and continue—not a reason to abandon the challenge.

## Hydration logging behavior

The `Get Water Intake` Shortcut presents five choices:

| Marker | Recorded value | Completion status |
| --- | --- | --- |
| 80 fl oz | `80 fl oz` | Complete |
| 70 fl oz | `70 fl oz` | Low water intake |
| 60 fl oz | `60 fl oz` | Low water intake |
| 40 fl oz | `40 fl oz` | Low water intake |
| 0 fl oz | `0 fl oz` | Low water intake |

The selected value is stored in the `Water Intake Response` variable. The Shortcut treats **80 fl oz** as the completion target. Any lower selection sets `Low Water Intake`, which is included in the reflection dictionary for the Notion record.

## Mindful-content logging behavior

The `Get Read Bible Prompt` Shortcut presents five markers:

- `Read 2 pages`
- `Prayer ☀️`
- `Prayer 🌙`
- `Mindful content`
- `Did not make time 🚫`

These values feed the faith/practice portion of the structured Notion record.

## Automation flow

1. `Combat Ready - Last 20 Lbs` starts the daily accountability flow.
2. `Log Discipline` coordinates the date and response collection.
3. Helper Shortcuts collect discipline, reflection, mindful-content, hydration, and exercise responses.
4. The responses are assembled into a structured dictionary.
5. `Discipline Http Request` maps the dictionary into a Notion API page request.
6. Notion stores the daily record and its Goal Tracker relation.
7. A Notion Chart makes consistency and progress visible over time.

Private database IDs, relation IDs, API secrets, and personal reflections are not published.
