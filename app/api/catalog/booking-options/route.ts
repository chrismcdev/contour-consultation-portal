import { getBookingOptions } from "@/lib/catalog/booking-options";
import type { BookingOptionsResponse } from "@/lib/catalog/contracts";

export const GET = async (): Promise<Response> => {
  try {
    return Response.json({ options: await getBookingOptions() } satisfies BookingOptionsResponse);
  } catch {
    return Response.json({ error: "Booking options are temporarily unavailable." }, { status: 503 });
  }
};
