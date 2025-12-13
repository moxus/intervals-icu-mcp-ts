import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  ActivitySchema,
  AthleteProfileSchema,
  EventSchema,
  WellnessSchema,
  WorkoutSchema,
  CreateEventSchema,
  UpdateEventSchema,
  CreateWorkoutSchema
} from './schemas.js';
import { z } from 'zod';

const API_BASE_URL = 'https://intervals.icu/api/v1';

export class IntervalsClient {
  private axios: AxiosInstance;
  private athleteId: string;

  constructor(athleteId: string, apiKey: string) {
    this.athleteId = athleteId;
    this.axios = axios.create({
      baseURL: API_BASE_URL,
      auth: {
        username: 'API_KEY',
        password: apiKey,
      },
    });
  }

  // --- Helper to handle API errors ---
  private handleError(error: unknown, context: string): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      const message = data && typeof data === 'object' && 'error' in data ? (data as any).error : error.message;
      throw new Error(`Intervals.icu API Error [${context}]: ${status} - ${message}`);
    }
    throw error;
  }

  // --- Athlete ---
  async getAthleteProfile() {
    try {
      // If the token is valid, this returns the athlete profile associated with the token
      // OR the one specified in the path if the token has access.
      // We use the ID from env.
      const response = await this.axios.get(`/athlete/${this.athleteId}`);
      return AthleteProfileSchema.parse(response.data);
    } catch (error) {
      this.handleError(error, 'getAthleteProfile');
    }
  }

  // --- Activities ---
  async getActivities(oldest: string, newest: string) {
    try {
      const response = await this.axios.get(`/athlete/${this.athleteId}/activities`, {
        params: { oldest, newest },
      });
      return z.array(ActivitySchema).parse(response.data);
    } catch (error) {
      this.handleError(error, 'getActivities');
    }
  }

  async getActivity(activityId: string) {
    try {
        const response = await this.axios.get(`/activity/${activityId}`);
        return ActivitySchema.parse(response.data);
    } catch (error) {
        this.handleError(error, 'getActivity');
    }
  }

  // --- Wellness ---
  async getWellness(oldest: string, newest: string) {
    try {
      const response = await this.axios.get(`/athlete/${this.athleteId}/wellness.json`, { // .json ext might be required or supported
        params: { oldest, newest },
      });
      return z.array(WellnessSchema).parse(response.data);
    } catch (error) {
      this.handleError(error, 'getWellness');
    }
  }

  // --- Library (Workouts) ---
  async getWorkouts() {
    try {
      const response = await this.axios.get(`/athlete/${this.athleteId}/workouts`);
      return z.array(WorkoutSchema).parse(response.data);
    } catch (error) {
      this.handleError(error, 'getWorkouts');
    }
  }

  async createWorkout(workout: z.infer<typeof CreateWorkoutSchema>) {
    try {
        const response = await this.axios.post(`/athlete/${this.athleteId}/workouts`, workout);
        return WorkoutSchema.parse(response.data);
    } catch (error) {
        this.handleError(error, 'createWorkout');
    }
  }

  // --- Events (Calendar) ---
  async getEvents(oldest: string, newest: string) {
    try {
      const response = await this.axios.get(`/athlete/${this.athleteId}/events`, {
        params: { oldest, newest },
      });
      return z.array(EventSchema).parse(response.data);
    } catch (error) {
      this.handleError(error, 'getEvents');
    }
  }

  async createEvent(event: z.infer<typeof CreateEventSchema>) {
    // Check if start_date_local is in the future is technically not required by API,
    // but the prompt says "modifying past events should not be possible".
    // Creating a past event is technically "modifying the past", so I will block it.
    const eventDate = new Date(event.start_date_local);
    const now = new Date();
    // Allow small buffer? No, strict "future only" for safety.
    // Actually, creating a note for today is fine. Creating something for yesterday is questionable.
    // Let's check if date < today (start of day).
    // Better: Check if date is before now.
    if (eventDate < now) {
        throw new Error("Cannot create events in the past.");
    }

    try {
      const response = await this.axios.post(`/athlete/${this.athleteId}/events`, event);
      return EventSchema.parse(response.data);
    } catch (error) {
      this.handleError(error, 'createEvent');
    }
  }

  async updateEvent(id: number, event: z.infer<typeof UpdateEventSchema>) {
    // 1. Fetch existing event to check date
    let existingEvent;
    try {
        const events = await this.axios.get(`/athlete/${this.athleteId}/events/${id}`);
        existingEvent = EventSchema.parse(events.data);
    } catch (e) {
        this.handleError(e, `fetchEventForUpdate-${id}`);
    }

    if (!existingEvent) {
         throw new Error("Event not found");
    }

    const eventDate = new Date(existingEvent.start_date_local);
    const now = new Date();

    if (eventDate < now) {
        throw new Error("Cannot modify past events.");
    }

    // 2. Perform update
    try {
      const response = await this.axios.put(`/athlete/${this.athleteId}/events/${id}`, event);
      return EventSchema.parse(response.data);
    } catch (error) {
      this.handleError(error, 'updateEvent');
    }
  }

  async deleteEvent(id: number) {
     // 1. Fetch existing event to check date
     let existingEvent;
     try {
         const events = await this.axios.get(`/athlete/${this.athleteId}/events/${id}`);
         existingEvent = EventSchema.parse(events.data);
     } catch (e) {
         this.handleError(e, `fetchEventForDelete-${id}`);
     }

     if (!existingEvent) {
          throw new Error("Event not found");
     }

     const eventDate = new Date(existingEvent.start_date_local);
     const now = new Date();

     if (eventDate < now) {
         throw new Error("Cannot delete past events.");
     }

    try {
      await this.axios.delete(`/athlete/${this.athleteId}/events/${id}`);
      return { success: true, id };
    } catch (error) {
      this.handleError(error, 'deleteEvent');
    }
  }
}
