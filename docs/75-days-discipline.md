# 75 Days of Discipline

## Purpose

75 Days of Discipline is a 75 Soft-style accountability challenge focused on consistency over perfection. It is designed to build the habits and follow-through needed to prepare for the Murph Challenge. If I really wanted to hold myself accountable, I needed more than a good intention; I needed a visual record that showed me whether I was actually following through.

Finch provides a companion accountability layer: it is a habit-tracking game with adorable pet care blended into a journaling and habit-tracking experience. Apple Shortcuts and Notion preserve the structured personal record; Finch is not the system of record.

I also did not want to pay for another specialized app and hope it had all the logging features I needed. Notion was the most practical logbook for me: flexible enough to capture the daily details, structured enough to show the metrics, and already part of my workflow.

The architecture diagram shows how the Shortcut prompts feed the logging layer, structured response dictionary, Notion API request, daily discipline database, Goal Tracker relation, and progress review.

## Daily challenge rules

- **Disciplined Day:** Make intentional choices and honor the day’s commitments.
- **Exercise:** Choose `Yes` or `No`; a `No` response records one reason: `Pain 🤕`, `Almost! 20 mins minimum.`, or `Not in the mood… 😓`.
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

## Shortcut log markers

The helper Shortcuts use the following exact markers and conditional follow-ups:

### Discipline

`Get Discipline Response` records `Yes` or `No` in `Disciplined Response`. When the response is `No`, it also records one or more reasons from `Distracted`, `Half-Committed`, or `Discouraged`, joined with `, ` in the disciplined response dictionary value.

### Exercise

`Get Exercise Response` records `Yes` or `No` under the `Exercise` dictionary key. When the response is `No`, it records one reason from `Pain 🤕`, `Almost! 20 mins minimum.`, or `Not in the mood… 😓`.

### Reflections

`Get Reflections Response` records `Yes` or `No`. A `Yes` response opens a free-text input for the reflection; a `No` response leaves the reflection text empty.

## Automation flow

1. `Combat Ready - Last 20 Lbs` starts the daily accountability flow.
2. `Log Discipline` coordinates the date and response collection.
3. Helper Shortcuts collect discipline, reflection, mindful-content, hydration, and exercise responses.
4. The responses are assembled into a structured dictionary.
5. `Discipline Http Request` maps the dictionary into a Notion API page request.
6. Notion stores the daily record and its Goal Tracker relation.
7. A Notion Chart makes consistency and progress visible over time.

Private database IDs, relation IDs, API secrets, and personal reflections are not published.
