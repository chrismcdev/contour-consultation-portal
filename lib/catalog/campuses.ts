import intersection from "lodash/intersection";

import type { BookingOptions } from "./contracts";

export const getEligibleCampuses = (options: BookingOptions, subjects: string[]): string[] =>
  intersection(...subjects.map(subject => (Object.hasOwn(options, subject) ? options[subject] : [])));
