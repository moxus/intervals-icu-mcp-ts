# Intervals.icu MCP Server

This is a Model Context Protocol (MCP) server for [Intervals.icu](https://intervals.icu). It allows you to interact with your Intervals.icu data, including activities, wellness data, and calendar events.

## Configuration

You need an API Key and your Athlete ID from Intervals.icu.

## Usage

Run the server using:

```bash
npx intervals-mcp
```

Or if installed globally/locally:

```bash
node dist/index.js
```

Ensure environment variables or arguments are provided as required (check `src/index.ts` or `--help` for details, usually `ATHLETE_ID` and `API_KEY` are needed).

## Tools

- `get_athlete_profile`: Get athlete details.
- `list_activities`: Get activities within a date range.
- `get_activity`: Get full details of an activity.
- `list_wellness`: Get wellness logs.
- `list_workouts`: Get workouts from the library.
- `create_workout`: Create a workout in the library.
- `list_events`: Get calendar events.
- `create_event`: Create an event (workout, note, etc.) on the calendar.
- `update_event`: Update an existing event.
- `delete_future_event`: Delete an event.

