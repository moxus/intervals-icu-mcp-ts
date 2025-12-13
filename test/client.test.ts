import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IntervalsClient } from '../src/api.js';
import axios from 'axios';
import { ActivitySchema, EventSchema } from '../src/schemas.js';

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
                name: "Past Workout"
            };

            await expect(client.createEvent(pastEvent)).rejects.toThrow("Cannot create events in the past");
            expect(mockedAxios.post).not.toHaveBeenCalled();
        });

        it('should allow creating an event in the future', async () => {
            const futureEvent = {
                start_date_local: futureDateStr,
                name: "Future Workout"
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
                name: "Old Workout"
            };
            mockedAxios.get.mockResolvedValue({ data: existingPastEvent });

            await expect(client.updateEvent(1, { name: "New Name" })).rejects.toThrow("Cannot modify past events");
            expect(mockedAxios.put).not.toHaveBeenCalled();
        });

        it('should allow updating a future event', async () => {
             // Mock fetching the existing event first
             const existingFutureEvent = {
                id: 2,
                start_date_local: futureDateStr,
                name: "Future Workout"
            };
            mockedAxios.get.mockResolvedValue({ data: existingFutureEvent });
            mockedAxios.put.mockResolvedValue({ data: { ...existingFutureEvent, name: "Updated Name" } });

            const result = await client.updateEvent(2, { name: "Updated Name" });
            expect(result.name).toBe("Updated Name");
            expect(mockedAxios.put).toHaveBeenCalled();
        });

        it('should throw error when deleting a past event', async () => {
            const existingPastEvent = {
                id: 1,
                start_date_local: pastDateStr,
                name: "Old Workout"
            };
            mockedAxios.get.mockResolvedValue({ data: existingPastEvent });

            await expect(client.deleteEvent(1)).rejects.toThrow("Cannot delete past events");
            expect(mockedAxios.delete).not.toHaveBeenCalled();
        });
    });

    describe('Zod Validation Integration', () => {
        it('should validate Activity data correctly', async () => {
             const validActivity = {
                 id: "act1",
                 start_date_local: "2023-01-01T10:00:00",
                 type: "Ride",
                 moving_time: 3600
             };
             mockedAxios.get.mockResolvedValue({ data: validActivity });

             const result = await client.getActivity("act1");
             expect(result).toEqual(validActivity);
        });

        it('should throw error on invalid data shape', async () => {
            const invalidActivity = {
                id: "act2",
                // Missing start_date_local and type
                moving_time: "not a number"
            };
            mockedAxios.get.mockResolvedValue({ data: invalidActivity });

            // The client.getActivity calls ActivitySchema.parse, which should throw ZodError
            await expect(client.getActivity("act2")).rejects.toThrow();
        });
    });
});
