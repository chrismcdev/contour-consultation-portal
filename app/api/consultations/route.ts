import { z } from "zod";

import { hasAdminRole } from "@/lib/auth/account";
import { getBookingOptions } from "@/lib/catalog/booking-options";
import { getEligibleCampuses } from "@/lib/catalog/campuses";
import { listConsultations, parsePage } from "@/lib/consultations/list";
import { bookingSchema, consultationScopeSchema, type Booking } from "@/lib/consultations/schema";
import { CONSULTATION_COLUMNS } from "@/lib/supabase/database";
import { HttpError, json, readJson, withUser } from "./http";

export const GET = (request: Request): Promise<Response> =>
  withUser(request, async (supabase, userId) => {
    const params = new URL(request.url).searchParams;
    const page = parsePage(params.get("page"));

    if (page === null) {
      throw new HttpError(400, "Page must be an integer between 1 and 1,000,000.");
    }

    const scope = consultationScopeSchema.parse(params.get("scope") ?? "mine");
    if (scope === "all" && !(await hasAdminRole(supabase, userId))) {
      throw new HttpError(403, "Administrator access is required.");
    }

    return json(await listConsultations(supabase, userId, scope, page));
  });

const bookingProblem = async ({ scheduledAt, subjects, campuses }: Booking): Promise<HttpError | null> => {
  if (Date.parse(scheduledAt) <= Date.now()) return new HttpError(400, "Choose a future consultation time.");
  const options = await getBookingOptions().catch(() => null);
  if (!options) return new HttpError(503, "Booking options are temporarily unavailable. Please try again.");
  const eligible = getEligibleCampuses(options, subjects);
  return campuses.every(campus => eligible.includes(campus))
    ? null
    : new HttpError(400, "Choose campuses that offer all your selected subjects.");
};

export const POST = (request: Request): Promise<Response> =>
  withUser(request, async supabase => {
    const requestId = z
      .uuid({ error: "Idempotency-Key must be a UUID." })
      .nullable()
      .parse(request.headers.get("Idempotency-Key"));
    const booking = bookingSchema.parse(await readJson(request));
    const problem = await bookingProblem(booking);
    const { firstName, lastName, scheduledAt, subjects, campuses, reason } = booking;
    const details = {
      first_name: firstName,
      last_name: lastName,
      scheduled_at: scheduledAt,
      subjects,
      campuses,
      reason
    };

    if (requestId) {
      const { data, status } = await supabase
        .rpc("book_consultation_once", {
          request_id: requestId,
          details,
          allow_create: !problem
        })
        .select(CONSULTATION_COLUMNS)
        .maybeSingle()
        .throwOnError();
      if (data) return json({ consultation: data }, status);
      throw problem ?? new Error("The booking request did not return a consultation.");
    }
    if (problem) throw problem;

    const { data } = await supabase
      .from("consultations")
      .insert(details)
      .select(CONSULTATION_COLUMNS)
      .single()
      .throwOnError();

    return json({ consultation: data }, 201);
  });
