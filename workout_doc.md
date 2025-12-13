# Workout Builder Syntax

When creating workouts or workout events, the `description` field uses the Intervals.icu builder syntax.

**Important for Repeating Steps:**
To create repeating intervals (e.g., 5x 3m hard, 3m easy), you **must** separate the repeating block with empty lines.

**Example:**

```text
- 15m Z2 Warmup

5x
- 3m Z5 VO2 Max
- 3m Z1 Recovery

- 10m Z1 Cooldown
```

Without the empty lines, the parser may not correctly identify the nested structure.
