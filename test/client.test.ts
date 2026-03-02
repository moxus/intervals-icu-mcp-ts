import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IntervalsClient } from '../src/api.js';
import axios from 'axios';
import { ActivitySchema, ActivitySummarySchema, EventSchema } from '../src/schemas.js';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

describe('IntervalsClient', () => {
  let client: IntervalsClient;
  const mockAthleteId = 'test-athlete';
  const mockApiKey = 'test-key';

  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.create.mockReturnThis();
    // Default mocked implementation for create instance methods
    mockedAxios.get = vi.fn();
    mockedAxios.post = vi.fn();
    mockedAxios.put = vi.fn();
    mockedAxios.delete = vi.fn();
    mockedAxios.isAxiosError = (payload: any) => !!payload.isAxiosError;

    client = new IntervalsClient(mockAthleteId, mockApiKey);
  });

  describe('Safety Guards (Past Events)', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 2); // 2 days ago
    const pastDateStr = pastDate.toISOString().split('.')[0]; // ISO-like

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2); // 2 days in future
    const futureDateStr = futureDate.toISOString().split('.')[0];

    it('should throw error when creating an event in the past', async () => {
      const pastEvent = {
        start_date_local: pastDateStr,
        name: 'Past Workout',
      };

      await expect(client.createEvent(pastEvent)).rejects.toThrow(
        'Cannot create events in the past',
      );
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should allow creating an event in the future', async () => {
      const futureEvent = {
        start_date_local: futureDateStr,
        name: 'Future Workout',
      };
      const mockResponse = { id: 123, ...futureEvent };
      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await client.createEvent(futureEvent);
      expect(result).toBeDefined();
      expect(mockedAxios.post).toHaveBeenCalled();
    });

    it('should throw error when updating a past event', async () => {
      // Mock fetching the existing event first
      const existingPastEvent = {
        id: 1,
        start_date_local: pastDateStr,
        name: 'Old Workout',
      };
      mockedAxios.get.mockResolvedValue({ data: existingPastEvent });

      await expect(client.updateEvent(1, { name: 'New Name' })).rejects.toThrow(
        'Cannot modify past events',
      );
      expect(mockedAxios.put).not.toHaveBeenCalled();
    });

    it('should allow updating a future event', async () => {
      // Mock fetching the existing event first
      const existingFutureEvent = {
        id: 2,
        start_date_local: futureDateStr,
        name: 'Future Workout',
      };
      mockedAxios.get.mockResolvedValue({ data: existingFutureEvent });
      mockedAxios.put.mockResolvedValue({ data: { ...existingFutureEvent, name: 'Updated Name' } });

      const result = await client.updateEvent(2, { name: 'Updated Name' });
      expect(result.name).toBe('Updated Name');
      expect(mockedAxios.put).toHaveBeenCalled();
    });

    it('should throw error when deleting a past event', async () => {
      const existingPastEvent = {
        id: 1,
        start_date_local: pastDateStr,
        name: 'Old Workout',
      };
      mockedAxios.get.mockResolvedValue({ data: existingPastEvent });

      await expect(client.deleteEvent(1)).rejects.toThrow('Cannot delete past events');
      expect(mockedAxios.delete).not.toHaveBeenCalled();
    });
  });

  describe('Zod Validation Integration', () => {
    it('should validate Activity data correctly', async () => {
      const validActivity = {
        id: 'act1',
        start_date_local: '2023-01-01T10:00:00',
        type: 'Ride',
        moving_time: 3600,
      };
      mockedAxios.get.mockResolvedValue({ data: validActivity });

      const result = await client.getActivity('act1');
      expect(result).toEqual(validActivity);
    });

    it('should throw error on invalid data shape', async () => {
      const invalidActivity = {
        id: 'act2',
        // Missing start_date_local and type
        moving_time: 'not a number',
      };
      mockedAxios.get.mockResolvedValue({ data: invalidActivity });

      // The client.getActivity calls ActivitySchema.parse, which should throw ZodError
      await expect(client.getActivity('act2')).rejects.toThrow();
    });

    it('should pass through extra fields on full ActivitySchema', () => {
      const dataWithExtras = {
        id: 'act1',
        start_date_local: '2023-01-01T10:00:00',
        type: 'Ride',
        moving_time: 3600,
        icu_training_load: 99,
      };
      const parsed = ActivitySchema.parse(dataWithExtras);
      expect(parsed).toHaveProperty('icu_training_load', 99);
      expect(parsed.id).toBe('act1');
    });

    it('should return only summary fields from ActivitySummarySchema', () => {
      const fullActivity = {
        id: 'act1',
        start_date_local: '2023-01-01T10:00:00',
        name: 'Morning Ride',
        type: 'Ride',
        distance: 50000,
        moving_time: 3600,
        elapsed_time: 4000,
        total_elevation_gain: 500,
        average_heartrate: 145,
        max_heartrate: 175,
        average_speed: 7.5,
        icu_training_load: 88,
        icu_atl: 55.2,
        icu_ctl: 42.1,
        calories: 900,
        commute: false,
        paired_event_id: 123,
        source: 'STRAVA',
        // These should be stripped:
        average_watts: 200,
        description: 'Long ride',
        icu_zone_times: [],
        skyline_chart_bytes: 'abc',
      };
      const parsed = ActivitySummarySchema.parse(fullActivity);
      expect(parsed).toEqual({
        id: 'act1',
        start_date_local: '2023-01-01T10:00:00',
        name: 'Morning Ride',
        type: 'Ride',
        distance: 50000,
        moving_time: 3600,
        elapsed_time: 4000,
        total_elevation_gain: 500,
        average_heartrate: 145,
        max_heartrate: 175,
        average_speed: 7.5,
        icu_training_load: 88,
        icu_atl: 55.2,
        icu_ctl: 42.1,
        calories: 900,
        commute: false,
        paired_event_id: 123,
        source: 'STRAVA',
      });
      expect(parsed).not.toHaveProperty('average_watts');
      expect(parsed).not.toHaveProperty('description');
      expect(parsed).not.toHaveProperty('skyline_chart_bytes');
    });

    it('should return summaries from getActivitiesSummary', async () => {
      const activitiesWithExtras = [
        {
          id: 'act1',
          start_date_local: '2023-01-01T10:00:00',
          name: 'Morning Ride',
          type: 'Ride',
          distance: 50000,
          moving_time: 3600,
          elapsed_time: 4000,
          total_elevation_gain: 500,
          average_heartrate: 145,
          max_heartrate: 175,
          average_speed: 7.5,
          icu_training_load: 88,
          icu_atl: 55.2,
          icu_ctl: 42.1,
          calories: 900,
          commute: false,
          paired_event_id: null,
          source: 'STRAVA',
          // Extra fields that should be stripped:
          average_watts: 200,
          skyline_chart_bytes: 'abc',
          icu_zone_times: [],
        },
      ];
      mockedAxios.get.mockResolvedValue({ data: activitiesWithExtras });

      const result = await client.getActivitiesSummary('2023-01-01', '2023-01-31');
      expect(result).toHaveLength(1);
      expect(result![0]).not.toHaveProperty('average_watts');
      expect(result![0]).not.toHaveProperty('skyline_chart_bytes');
      expect(result![0]).not.toHaveProperty('icu_zone_times');
      expect(result![0].id).toBe('act1');
      expect(result![0].icu_training_load).toBe(88);
      expect(result![0].source).toBe('STRAVA');
    });
  });
});
