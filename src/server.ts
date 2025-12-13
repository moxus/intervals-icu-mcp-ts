import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { IntervalsClient } from './api.js';
import { removeNulls } from './utils.js';
import {
  DateRangeSchema,
  CreateEventSchema,
  UpdateEventSchema,
  CreateWorkoutSchema,
} from './schemas.js';

export async function startServer(athleteId: string, apiKey: string) {
  const server = new McpServer({
    name: 'intervals-mcp',
    version: '1.0.0',
  });

  const client = new IntervalsClient(athleteId, apiKey);

  // --- Tools ---

  // 1. Get Athlete Profile
  server.tool(
    'get_athlete_profile',
    'Get the profile of the configured athlete.',
    {}, // No args
    async () => {
      const profile = await client.getAthleteProfile();
      return {
        content: [{ type: 'text', text: JSON.stringify(removeNulls(profile), null, 2) }],
      };
    },
  );

  // 2. List Activities
  server.tool(
    'list_activities',
    'List activities for the athlete within a date range.',
    {
      oldest: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe('Start date (YYYY-MM-DD)'),
      newest: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe('End date (YYYY-MM-DD)'),
    },
    async ({ oldest, newest }) => {
      const activities = await client.getActivities(oldest, newest);
      return {
        content: [{ type: 'text', text: JSON.stringify(removeNulls(activities), null, 2) }],
      };
    },
  );

  // 3. Get Single Activity
  server.tool(
    'get_activity',
    'Get details of a specific activity by ID.',
    {
      id: z.string().describe('The Activity ID'),
    },
    async ({ id }) => {
      const activity = await client.getActivity(id);
      return {
        content: [{ type: 'text', text: JSON.stringify(removeNulls(activity), null, 2) }],
      };
    },
  );

  // 4. List Wellness Data
  server.tool(
    'list_wellness',
    'List wellness data (sleep, fatigue, etc.) for the athlete within a date range.',
    {
      oldest: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe('Start date (YYYY-MM-DD)'),
      newest: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe('End date (YYYY-MM-DD)'),
    },
    async ({ oldest, newest }) => {
      const wellness = await client.getWellness(oldest, newest);
      return {
        content: [{ type: 'text', text: JSON.stringify(removeNulls(wellness), null, 2) }],
      };
    },
  );

  // 5. List Workouts (Library)
  server.tool('list_workouts', "List all workouts in the athlete's library.", {}, async () => {
    const workouts = await client.getWorkouts();
    return {
      content: [{ type: 'text', text: JSON.stringify(removeNulls(workouts), null, 2) }],
    };
  });

  // 6. Create Workout
  server.tool(
    'create_workout',
    'Create a new workout in the library.',
    {
      name: z.string().describe('Workout Name'),
      description: z
        .string()
        .optional()
        .describe(
          "Workout steps/description text. MUST follow Intervals.icu builder syntax. For repeating steps (e.g. 5x), insert an empty line before and after the block (e.g. '\\n\\n5x\\n- 3m Z5\\n- 3m Z1\\n\\n'). Use \\n for new lines.",
        ),
      folder_id: z.number().int().optional().describe('Folder ID to place the workout in'),
      type: z.string().optional().describe('Sport type (Ride, Run, etc.)'),
      indoor: z.boolean().optional(),
    },
    async (args) => {
      const workout = await client.createWorkout(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(removeNulls(workout), null, 2) }],
      };
    },
  );

  // 7. List Events (Calendar)
  server.tool(
    'list_events',
    'List calendar events (planned workouts, notes, etc.) within a date range.',
    {
      oldest: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe('Start date (YYYY-MM-DD)'),
      newest: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .describe('End date (YYYY-MM-DD)'),
    },
    async ({ oldest, newest }) => {
      const events = await client.getEvents(oldest, newest);
      return {
        content: [{ type: 'text', text: JSON.stringify(removeNulls(events), null, 2) }],
      };
    },
  );

  // 8. Create Event
  server.tool(
    'create_event',
    'Create a new event on the calendar (must be in the future).',
    {
      start_date_local: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
        .describe('Start DateTime (ISO-8601 Local)'),
      name: z.string().optional(),
      category: z
        .enum([
          'WORKOUT',
          'RACE_A',
          'RACE_B',
          'RACE_C',
          'NOTE',
          'PLAN',
          'HOLIDAY',
          'SICK',
          'INJURED',
          'SET_EFTP',
          'FITNESS_DAYS',
          'SEASON_START',
          'TARGET',
          'SET_FITNESS',
        ])
        .optional(),
      description: z
        .string()
        .optional()
        .describe(
          "Description/Notes. If category=WORKOUT, this MUST follow Intervals.icu builder syntax. For repeating steps (e.g. 5x), insert an empty line before and after the block (e.g. '\\n\\n5x\\n- 3m Z5\\n- 3m Z1\\n\\n'). Otherwise, it is free text.",
        ),
      type: z.string().optional(),
    },
    async (args) => {
      const event = await client.createEvent(args);
      return {
        content: [{ type: 'text', text: JSON.stringify(removeNulls(event), null, 2) }],
      };
    },
  );

  // 9. Update Event
  server.tool(
    'update_event',
    'Update a future event on the calendar.',
    {
      id: z.number().int().describe('Event ID'),
      start_date_local: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
        .optional(),
      name: z.string().optional(),
      description: z
        .string()
        .optional()
        .describe(
          "Description/Notes. If category=WORKOUT, this MUST follow Intervals.icu builder syntax. For repeating steps (e.g. 5x), insert an empty line before and after the block (e.g. '\\n\\n5x\\n- 3m Z5\\n- 3m Z1\\n\\n'). Otherwise, it is free text.",
        ),
      category: z
        .enum([
          'WORKOUT',
          'RACE_A',
          'RACE_B',
          'RACE_C',
          'NOTE',
          'PLAN',
          'HOLIDAY',
          'SICK',
          'INJURED',
          'SET_EFTP',
          'FITNESS_DAYS',
          'SEASON_START',
          'TARGET',
          'SET_FITNESS',
        ])
        .optional(),
    },
    async (args) => {
      const { id, ...updateData } = args;
      const event = await client.updateEvent(id, updateData);
      return {
        content: [{ type: 'text', text: JSON.stringify(removeNulls(event), null, 2) }],
      };
    },
  );

  // 10. Delete Event
  server.tool(
    'delete_future_event',
    'Delete a future event from the calendar.',
    {
      id: z.number().int().describe('Event ID'),
    },
    async ({ id }) => {
      const result = await client.deleteEvent(id);
      return {
        content: [{ type: 'text', text: JSON.stringify(removeNulls(result), null, 2) }],
      };
    },
  );

  // Connect to transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
