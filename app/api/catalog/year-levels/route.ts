import { getYearLevels } from "@/lib/catalog/booking-options";
import type { YearLevelsResponse } from "@/lib/catalog/contracts";

export const GET = async (): Promise<Response> => {
  try {
    return Response.json({ yearLevels: await getYearLevels() } satisfies YearLevelsResponse);
  } catch {
    return Response.json({ error: "Year levels are temporarily unavailable." }, { status: 503 });
  }
};
