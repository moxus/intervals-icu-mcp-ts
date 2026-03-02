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

// --- Activity (detail view: 111 curated fields, drops 63 internal/noise fields) ---
const nullableNumberArray = z.array(z.number()).nullable().optional();

export const ActivitySchema = z.object({
  // Core identity
  id: z.string(),
  start_date_local: z.string(),
  start_date: nullableString,
  name: nullableString,
  type: nullableString, // nullable: some stub/hidden activities lack type
  sub_type: nullableString,
  description: nullableString,
  source: nullableString,
  external_id: nullableString,
  strava_id: nullableString,

  // Time
  moving_time: nullableInt,
  elapsed_time: nullableInt,
  icu_recording_time: nullableInt,
  coasting_time: nullableInt,
  icu_warmup_time: nullableInt,
  icu_cooldown_time: nullableInt,

  // Distance & speed
  distance: nullableNumber,
  average_speed: nullableNumber,
  max_speed: nullableNumber,
  pace: nullableNumber,
  gap: nullableNumber,
  threshold_pace: nullableNumber,

  // Elevation
  total_elevation_gain: nullableNumber,
  total_elevation_loss: nullableNumber,
  average_altitude: nullableNumber,
  min_altitude: nullableNumber,
  max_altitude: nullableNumber,

  // Heart rate
  average_heartrate: nullableInt,
  max_heartrate: nullableInt,
  lthr: nullableInt,
  icu_resting_hr: nullableInt,

  // Power
  icu_average_watts: nullableInt,
  icu_weighted_avg_watts: nullableInt,
  icu_ftp: nullableInt,
  device_watts: nullableBoolean,
  icu_joules: nullableInt,
  icu_joules_above_ftp: nullableInt,
  icu_max_wbal_depletion: nullableInt,
  p_max: nullableNumber,
  icu_w_prime: nullableNumber,

  // Cadence & stride
  average_cadence: nullableNumber,
  average_stride: nullableNumber,
  icu_cadence_z2: nullableNumber,

  // Training load & fitness
  icu_training_load: nullableNumber,
  icu_atl: nullableNumber,
  icu_ctl: nullableNumber,
  icu_intensity: nullableNumber,
  trimp: nullableNumber,
  calories: nullableNumber,
  power_load: nullableNumber,
  hr_load: nullableNumber,
  pace_load: nullableNumber,
  hr_load_type: nullableString,
  pace_load_type: nullableString,
  strain_score: nullableNumber,
  session_rpe: nullableNumber,

  // Performance metrics
  decoupling: nullableNumber,
  icu_efficiency_factor: nullableNumber,
  icu_variability_index: nullableNumber,
  icu_power_hr: nullableNumber,
  icu_power_hr_z2: nullableNumber,
  icu_power_hr_z2_mins: nullableNumber,
  compliance: nullableNumber,
  polarization_index: nullableNumber,

  // Zone times
  icu_zone_times: z.array(z.record(z.unknown())).nullable().optional(),
  icu_hr_zone_times: nullableNumberArray,
  pace_zone_times: nullableNumberArray,
  gap_zone_times: nullableNumberArray,
  use_gap_zone_times: nullableBoolean,

  // Zone boundaries (athlete config at time of activity)
  icu_hr_zones: nullableNumberArray,
  icu_power_zones: nullableNumberArray,
  pace_zones: nullableNumberArray,
  icu_sweet_spot_min: nullableNumber,
  icu_sweet_spot_max: nullableNumber,

  // RPE & feel
  icu_rpe: nullableInt,
  feel: nullableInt,

  // Context flags
  commute: nullableBoolean,
  race: nullableBoolean,
  trainer: nullableBoolean,

  // Equipment & device
  device_name: nullableString,
  gear: z.record(z.unknown()).nullable().optional(),

  // Linked data
  paired_event_id: nullableInt,
  icu_lap_count: nullableInt,
  interval_summary: z.array(z.string()).nullable().optional(),
  icu_achievements: z.array(z.unknown()).nullable().optional(),
  icu_hrr: z.record(z.unknown()).nullable().optional(),

  // Temperature (device sensor)
  average_temp: nullableNumber,
  min_temp: nullableNumber,
  max_temp: nullableNumber,

  // Weather
  average_weather_temp: nullableNumber,
  min_weather_temp: nullableNumber,
  max_weather_temp: nullableNumber,
  average_feels_like: nullableNumber,
  min_feels_like: nullableNumber,
  max_feels_like: nullableNumber,
  average_wind_speed: nullableNumber,
  average_wind_gust: nullableNumber,
  prevailing_wind_deg: nullableNumber,
  headwind_percent: nullableNumber,
  tailwind_percent: nullableNumber,
  average_clouds: nullableNumber,
  max_rain: nullableNumber,
  max_snow: nullableNumber,

  // Athlete context at time of activity
  icu_weight: nullableNumber,

  // Niche sport fields
  carbs_used: nullableNumber,
  carbs_ingested: nullableNumber,
  kg_lifted: nullableNumber,
  lengths: nullableInt,
  pool_length: nullableNumber,

  // Tags & attachments
  tags: z.array(z.string()).nullable().optional(),
  attachments: z.array(z.unknown()).nullable().optional(),
});

// Summary schema for list_activities (token-efficient: 18 key fields vs 111 in detail view)
export const ActivitySummarySchema = z.object({
  id: z.string(),
  start_date_local: z.string(),
  name: nullableString,
  type: nullableString,
  distance: nullableNumber,
  moving_time: nullableInt,
  elapsed_time: nullableInt,
  total_elevation_gain: nullableNumber,
  average_heartrate: nullableInt,
  max_heartrate: nullableInt,
  average_speed: nullableNumber,
  icu_training_load: nullableNumber,
  icu_atl: nullableNumber,
  icu_ctl: nullableNumber,
  calories: nullableNumber,
  commute: nullableBoolean,
  paired_event_id: nullableInt,
  source: nullableString,
});

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
