import { z } from 'zod';

// --- Athlete ---
export const AthleteProfileSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  email: z.string().optional(),
  timezone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  sex: z.string().optional(),
  profile_medium: z.string().optional(),
});

// --- Activity ---
export const ActivitySchema = z.object({
  id: z.string(),
  start_date_local: z.string(), // ISO-8601
  name: z.string().optional(),
  type: z.string(),
  distance: z.number().optional(), // meters
  moving_time: z.number().int().optional(), // seconds
  elapsed_time: z.number().int().optional(),
  total_elevation_gain: z.number().optional(),
  average_heartrate: z.number().int().optional(),
  max_heartrate: z.number().int().optional(),
  average_speed: z.number().optional(), // m/s
  average_watts: z.number().int().optional(),
  weighted_average_watts: z.number().int().optional(),
  normalized_power: z.number().int().optional(),
  kilojoules: z.number().optional(),
  device_name: z.string().optional(),
  description: z.string().optional(),
  source: z.string().optional(),
  trainer: z.boolean().optional(),
  commute: z.boolean().optional(),
});

// --- Wellness ---
export const WellnessSchema = z.object({
  id: z.string(), // Date ISO-8601 YYYY-MM-DD
  updated: z.string().optional(), // Timestamp
  weight: z.number().optional(),
  restingHR: z.number().int().optional(),
  hrv: z.number().optional(),
  sleepSecs: z.number().int().optional(),
  sleepScore: z.number().optional(),
  sleepQuality: z.number().int().optional(),
  fatigue: z.number().int().optional(), // 1-4?
  stress: z.number().int().optional(),
  mood: z.number().int().optional(),
  motivation: z.number().int().optional(),
  injury: z.number().int().optional(),
  soreness: z.number().int().optional(),
  comments: z.string().optional(),
  ctl: z.number().optional(),
  atl: z.number().optional(),
  rampRate: z.number().optional(),
});

// --- Workout (Library) ---
export const WorkoutSchema = z.object({
  id: z.number().int().optional(), // Optional for new workouts
  folder_id: z.number().int().optional(),
  name: z.string(),
  description: z.string().optional(), // The workout steps text
  type: z.string().optional(), // Ride, Run, etc.
  indoor: z.boolean().optional(),
  distance: z.number().optional(),
  moving_time: z.number().int().optional(), // Estimated time
  tags: z.array(z.string()).optional(),
});

// --- Event (Calendar) ---
export const EventSchema = z.object({
  id: z.number().int().optional(),
  category: z.enum([
    'WORKOUT', 'RACE_A', 'RACE_B', 'RACE_C', 'NOTE', 'PLAN', 'HOLIDAY',
    'SICK', 'INJURED', 'SET_EFTP', 'FITNESS_DAYS', 'SEASON_START', 'TARGET', 'SET_FITNESS'
  ]).optional(),
  start_date_local: z.string(), // ISO-8601
  end_date_local: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(), // Workout text or note
  type: z.string().optional(), // Sport type e.g. Ride, Run
  moving_time: z.number().int().optional(),
  distance: z.number().optional(),
  color: z.string().optional(),
  indoor: z.boolean().optional(),
  not_on_fitness_chart: z.boolean().optional(),
  show_as_note: z.boolean().optional(),
  url: z.string().optional(),
  athlete_id: z.string().optional(),
});

// --- Input/Output Schemas for MCP Tools ---

// Filter schemas
export const DateRangeSchema = z.object({
  oldest: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD").optional(),
  newest: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format must be YYYY-MM-DD").optional(),
});

// Create/Update schemas
export const CreateEventSchema = EventSchema.omit({ id: true, athlete_id: true }).extend({
    start_date_local: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/, "Format must be ISO-8601 Local DateTime (YYYY-MM-DDTHH:mm:ss)"),
});

export const UpdateEventSchema = EventSchema.omit({ athlete_id: true }).partial().extend({
    id: z.number().int(), // Required for update
});

export const CreateWorkoutSchema = WorkoutSchema.omit({ id: true });
