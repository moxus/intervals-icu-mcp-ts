# Intervals.icu MCP Server

This is a Model Context Protocol (MCP) server for [Intervals.icu](https://intervals.icu). It allows you to interact with your Intervals.icu data, including activities, wellness data, and calendar events.

## Configuration

You need an API Key and your Athlete ID from Intervals.icu.

### Environment Variables

| Variable               | Description                                    |
| :--------------------- | :--------------------------------------------- |
| `INTERVALS_ATHLETE_ID` | Your Intervals.icu Athlete ID (e.g., `i12345`) |
| `INTERVALS_API_KEY`    | Your Intervals.icu API Key                     |

### Setting Environment Variables

#### macOS / Linux

You can set environment variables in your terminal session or add them to your shell configuration file (e.g., `.bashrc`, `.zshrc`).

```bash
export INTERVALS_ATHLETE_ID="your_athlete_id"
export INTERVALS_API_KEY="your_api_key"
```

To make them permanent, add the lines above to your `~/.zshrc` or `~/.bashrc` file and run `source ~/.zshrc` (or `source ~/.bashrc`).

#### Windows (Command Prompt)

```cmd
set INTERVALS_ATHLETE_ID=your_athlete_id
set INTERVALS_API_KEY=your_api_key
```

Note: This sets the variables for the current session only. To set them permanently, use the System Properties dialog or `setx`.

#### Windows (PowerShell)

```powershell
$env:INTERVALS_ATHLETE_ID="your_athlete_id"
$env:INTERVALS_API_KEY="your_api_key"
```

To set them permanently:

```powershell
[System.Environment]::SetEnvironmentVariable('INTERVALS_ATHLETE_ID', 'your_athlete_id', [System.EnvironmentVariableTarget]::User)
[System.Environment]::SetEnvironmentVariable('INTERVALS_API_KEY', 'your_api_key', [System.EnvironmentVariableTarget]::User)
```

## Usage

Run the server using the package:

```bash
npx @moxus/intervals-mcp
```

Or if running from source:

```bash
node dist/index.js
```

### Verify Command

You can verify your configuration and connection to Intervals.icu using the `verify` command. This will attempt to fetch your athlete profile.

```bash
npx @moxus/intervals-mcp verify
```

If successful, you will see your athlete details. If it fails, check your API key and Athlete ID.

## Adding to Gemini CLI Agent

To add this MCP server to a CLI agent like `gemini-cli` (or similar agents that support MCP), you typically need to configure the agent to spawn this server process.

Assuming `gemini-cli` supports an MCP configuration file (like `mcp_config.json` or command line arguments), you would add an entry for `@moxus/intervals-mcp`.

Example configuration (conceptual):

```json
{
  "mcpServers": {
    "intervals": {
      "command": "npx",
      "args": ["-y", "@moxus/intervals-mcp"],
      "env": {
        "INTERVALS_ATHLETE_ID": "your_athlete_id",
        "INTERVALS_API_KEY": "your_api_key"
      }
    }
  }
}
```

Or if you are running it locally from source:

```json
{
  "mcpServers": {
    "intervals": {
      "command": "node",
      "args": ["/path/to/intervals-icu-mcp-ts/dist/index.js"],
      "env": {
        "INTERVALS_ATHLETE_ID": "your_athlete_id",
        "INTERVALS_API_KEY": "your_api_key"
      }
    }
  }
}
```

Consult the documentation of the specific agent you are using for the exact configuration format.

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
