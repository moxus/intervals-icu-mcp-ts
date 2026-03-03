import {
  ActivitySchema,
  ActivitySummarySchema,
  AthleteProfileSchema,
  EventSchema,
  WellnessSchema,
  WorkoutSchema,
  CreateEventSchema,
  UpdateEventSchema,
  CreateWorkoutSchema,
} from './schemas.js';
import { z } from 'zod';

const API_BASE_URL = 'https://intervals.icu/api/v1';

export class IntervalsClient {
  private baseUrl: string;
  private athleteId: string;
  private authHeader: string;

  constructor(athleteId: string, apiKey: string) {
    this.baseUrl = API_BASE_URL;
    this.athleteId = athleteId;
    this.authHeader = 'Basic ' + btoa(`API_KEY:${apiKey}`);
  }

  // --- Helper to make requests ---
  private async request(path: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: this.authHeader,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let message = response.statusText;
      try {
        const body = await response.json();
        if (body && typeof body === 'object' && 'error' in body) {
          message = (body as any).error;
        }
      } catch {
        // ignore JSON parse errors
      }
      throw new Error(`Intervals.icu API Error: ${response.status} - ${message}`);
    }

    // DELETE responses may have no body
    if (response.status === 204) {
      return undefined;
    }

    return response.json();
  }

  private async get(path: string, params?: Record<string, string>): Promise<any> {
    let url = path;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
    return this.request(url);
  }

  private async post(path: string, body: any): Promise<any> {
    return this.request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  private async put(path: string, body: any): Promise<any> {
    return this.request(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  private async del(path: string): Promise<any> {
    return this.request(path, { method: 'DELETE' });
  }

  // --- Athlete ---
  async getAthleteProfile() {
    const data = await this.get(`/athlete/${this.athleteId}`);
    return AthleteProfileSchema.parse(data);
  }

  // --- Activities ---
  async getActivities(oldest: string, newest: string) {
    const data = await this.get(`/athlete/${this.athleteId}/activities`, { oldest, newest });
    return z.array(ActivitySchema).parse(data);
  }

  async getActivitiesSummary(oldest: string, newest: string) {
    const data = await this.get(`/athlete/${this.athleteId}/activities`, { oldest, newest });
    return z.array(ActivitySummarySchema).parse(data);
  }

  async getActivity(activityId: string) {
    const data = await this.get(`/activity/${activityId}`);
    return ActivitySchema.parse(data);
  }

  // --- Wellness ---
  async getWellness(oldest: string, newest: string) {
    const data = await this.get(`/athlete/${this.athleteId}/wellness.json`, { oldest, newest });
    return z.array(WellnessSchema).parse(data);
  }

  // --- Library (Workouts) ---
  async getWorkouts() {
    const data = await this.get(`/athlete/${this.athleteId}/workouts`);
    return z.array(WorkoutSchema).parse(data);
  }

  async createWorkout(workout: z.infer<typeof CreateWorkoutSchema>) {
    const data = await this.post(`/athlete/${this.athleteId}/workouts`, workout);
    return WorkoutSchema.parse(data);
  }

  // --- Events (Calendar) ---
  async getEvents(oldest: string, newest: string) {
    const data = await this.get(`/athlete/${this.athleteId}/events`, { oldest, newest });
    return z.array(EventSchema).parse(data);
  }

  async createEvent(event: z.infer<typeof CreateEventSchema>) {
    const eventDate = new Date(event.start_date_local);
    const now = new Date();
    if (eventDate < now) {
      throw new Error('Cannot create events in the past.');
    }

    const data = await this.post(`/athlete/${this.athleteId}/events`, event);
    return EventSchema.parse(data);
  }

  async updateEvent(id: number, event: z.infer<typeof UpdateEventSchema>) {
    // 1. Fetch existing event to check date
    const existingData = await this.get(`/athlete/${this.athleteId}/events/${id}`);
    const existingEvent = EventSchema.parse(existingData);

    const eventDate = new Date(existingEvent.start_date_local);
    const now = new Date();

    if (eventDate < now) {
      throw new Error('Cannot modify past events.');
    }

    // 2. Perform update
    const data = await this.put(`/athlete/${this.athleteId}/events/${id}`, event);
    return EventSchema.parse(data);
  }

  async deleteEvent(id: number) {
    // 1. Fetch existing event to check date
    const existingData = await this.get(`/athlete/${this.athleteId}/events/${id}`);
    const existingEvent = EventSchema.parse(existingData);

    const eventDate = new Date(existingEvent.start_date_local);
    const now = new Date();

    if (eventDate < now) {
      throw new Error('Cannot delete past events.');
    }

    await this.del(`/athlete/${this.athleteId}/events/${id}`);
    return { success: true, id };
  }
}
