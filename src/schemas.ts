import { z } from 'zod';

// Helper to allow null or undefined (since API might return null)
const nullableString = z.string().nullable().optional();
const nullableNumber = z.number().nullable().optional();
const nullableInt = z.number().int().nullable().optional();
const nullableBoolean = z.boolean().nullable().optional();

// --- Athlete ---
export const AthleteProfileSchema = z.object({
  id: z.string(),
  name: nullableString,
  firstname: nullableString,
  lastname: nullableString,
  email: nullableString,
  timezone: nullableString,
  city: nullableString,
  country: nullableString,
  sex: nullableString,
  profile_medium: nullableString,
});

// --- Activity ---
export const ActivitySchema = z
  .object({
    id: z.string(),
    start_date_local: z.string(), // ISO-8601
    name: nullableString,
    // The 'type' field is actually not guaranteed or might be null/undefined in some cases?
    // Wait, the API docs say 'type' is a string enum, but looking at the errors:
    // "path": [4, "type"], "received": "undefined", "message": "Required"
    // It seems some activities in the array DO NOT have a 'type'.
    // Looking at the dump, there are objects like:
    // { "id": "10526317718", "icu_athlete_id": "i13287", "start_date_local": "...", "source": "STRAVA", "_note": "..." }
    // These are "Hidden" or stub activities where 'type' is missing.
    // We need to handle this union type (Activity | Hidden) or just make type optional.
    type: nullableString,
    distance: nullableNumber, // meters
    moving_time: nullableInt, // seconds
    elapsed_time: nullableInt,
    total_elevation_gain: nullableNumber,
    average_heartrate: nullableInt,
    max_heartrate: nullableInt,
    average_speed: nullableNumber, // m/s
    average_watts: nullableInt,
    weighted_average_watts: nullableInt,
    normalized_power: nullableInt,
    kilojoules: nullableNumber,
    device_name: nullableString,
    description: nullableString,
    source: nullableString,
    trainer: nullableBoolean,
    commute: nullableBoolean,
  })
  .passthrough(); // Allow extra fields to avoid strict issues if I missed some

// --- Wellness ---
export const WellnessSchema = z
  .object({
    id: z.string(), // Date ISO-8601 YYYY-MM-DD
    updated: nullableString, // Timestamp
    weight: nullableNumber,
    restingHR: nullableInt,
    hrv: nullableNumber,
    sleepSecs: nullableInt,
    sleepScore: nullableNumber,
    sleepQuality: nullableInt,
    fatigue: nullableInt, // 1-4?
    stress: nullableInt,
    mood: nullableInt,
    motivation: nullableInt,
    injury: nullableInt,
    soreness: nullableInt,
    comments: nullableString,
    ctl: nullableNumber,
    atl: nullableNumber,
    rampRate: nullableNumber,
  })
  .passthrough();

// --- Workout (Library) ---
export const WorkoutSchema = z
  .object({
    id: nullableInt, // Optional for new workouts
    folder_id: nullableInt,
    name: z.string(),
    description: nullableString, // The workout steps text
    type: nullableString, // Ride, Run, etc.
    indoor: nullableBoolean,
    distance: nullableNumber,
    moving_time: nullableInt, // Estimated time
    tags: z.array(z.string()).nullable().optional(),
  })
  .passthrough();

// --- Event (Calendar) ---
export const EventSchema = z
  .object({
    id: nullableInt,
    category: z.string().nullable().optional(), // Relax enum to string to avoid issues with new categories
    start_date_local: z.string(), // ISO-8601
    end_date_local: nullableString,
    name: nullableString,
    description: nullableString, // Workout text or note
    type: nullableString, // Sport type e.g. Ride, Run
    moving_time: nullableInt,
    distance: nullableNumber,
    color: nullableString,
    indoor: nullableBoolean,
    not_on_fitness_chart: nullableBoolean,
    show_as_note: nullableBoolean,
    url: nullableString,
    athlete_id: nullableString,
  })
  .passthrough();

// --- Input/Output Schemas for MCP Tools ---

// Filter schemas
export const DateRangeSchema = z.object({
  oldest: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD')
    .optional(),
  newest: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD')
    .optional(),
});

// Create/Update schemas
export const CreateEventSchema = z.object({
  start_date_local: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
      'Format must be ISO-8601 Local DateTime (YYYY-MM-DDTHH:mm:ss)',
    ),
  category: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
  moving_time: z.number().int().optional(),
  distance: z.number().optional(),
  color: z.string().optional(),
  indoor: z.boolean().optional(),
  not_on_fitness_chart: z.boolean().optional(),
  show_as_note: z.boolean().optional(),
  url: z.string().optional(),
});

export const UpdateEventSchema = z.object({
  id: z.number().int(), // Required for update
  start_date_local: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/,
      'Format must be ISO-8601 Local DateTime (YYYY-MM-DDTHH:mm:ss)',
    )
    .optional(),
  category: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
  moving_time: z.number().int().optional(),
  distance: z.number().optional(),
  color: z.string().optional(),
  indoor: z.boolean().optional(),
  not_on_fitness_chart: z.boolean().optional(),
  show_as_note: z.boolean().optional(),
  url: z.string().optional(),
});

export const CreateWorkoutSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  folder_id: z.number().int().optional(),
  type: z.string().optional(),
  indoor: z.boolean().optional(),
  distance: z.number().optional(),
  moving_time: z.number().int().optional(),
  tags: z.array(z.string()).optional(),
});
