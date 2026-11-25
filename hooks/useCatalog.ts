"use client";

import { useDebouncedValue } from "@mantine/hooks";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import {
  bookingOptionsResponse,
  MIN_SCHOOL_QUERY_LENGTH,
  schoolsResponse,
  yearLevelsResponse,
  type BookingOptions
} from "@/lib/catalog/contracts";

const fetchCatalog = async (url: string, signal: AbortSignal): Promise<unknown> => {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Could not load catalog (${response.status}).`);

  return response.json();
};

export const useYearLevels = (): UseQueryResult<string[]> =>
  useQuery({
    queryKey: ["catalog", "year-levels"],
    queryFn: async ({ signal }) =>
      yearLevelsResponse.parse(await fetchCatalog("/api/catalog/year-levels", signal)).yearLevels
  });

export const useBookingOptions = (opened: boolean): UseQueryResult<BookingOptions> =>
  useQuery({
    queryKey: ["catalog", "booking-options"],
    enabled: opened,
    queryFn: async ({ signal }) =>
      bookingOptionsResponse.parse(await fetchCatalog("/api/catalog/booking-options", signal)).options
  });

export const useSchoolSearch = (query: string): UseQueryResult<string[]> => {
  const [debounced] = useDebouncedValue(query, 250);
  const term = query.length >= MIN_SCHOOL_QUERY_LENGTH && query === debounced ? query : "";

  return useQuery({
    queryKey: ["catalog", "schools", term],
    enabled: Boolean(term),
    queryFn: async ({ signal }) =>
      schoolsResponse.parse(await fetchCatalog(`/api/schools?q=${encodeURIComponent(term)}`, signal)).schools
  });
};
