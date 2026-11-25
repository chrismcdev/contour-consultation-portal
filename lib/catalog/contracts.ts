import { z } from "zod";

export const MIN_SCHOOL_QUERY_LENGTH = 2;

const labels = z.array(z.string());
export const bookingOptionsResponse = z.object({ options: z.record(z.string(), labels) });
export const schoolsResponse = z.object({ schools: labels });
export const yearLevelsResponse = z.object({ yearLevels: labels });

export type BookingOptionsResponse = z.output<typeof bookingOptionsResponse>;
export type BookingOptions = BookingOptionsResponse["options"];
export type SchoolsResponse = z.output<typeof schoolsResponse>;
export type YearLevelsResponse = z.output<typeof yearLevelsResponse>;
