import { PostgrestError } from "@supabase/supabase-js";
import { ZodError } from "zod";

import { isAuthServiceUnavailable } from "@/lib/supabase/auth-errors";
import { createClient } from "@/lib/supabase/server";
import type { Consultation, ConsultationPage } from "@/lib/consultations/schema";
import type { DatabaseClient } from "@/lib/supabase/database";
import { isCrossOriginRequest } from "../origin";

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}

type ConsultationJson = ConsultationPage | { consultation: Consultation } | { error: string };

export const json = (body: ConsultationJson, status = 200): Response => Response.json(body, { status });

export const readJson = async (request: Request): Promise<unknown> => {
  const mediaType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (mediaType !== "application/json") throw new HttpError(415, "Send application/json.");
  if (!request.body) throw new HttpError(400, "Send the consultation details.");

  let bytes = 0;
  const body = request.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform: (chunk, controller) => {
        bytes += chunk.byteLength;
        if (bytes > 16_384) throw new HttpError(413, "The consultation details are too long.");
        controller.enqueue(chunk);
      }
    })
  );

  try {
    return await new Response(body).json();
  } catch (error) {
    if (error instanceof SyntaxError) throw new HttpError(400, "Send valid JSON.");
    throw error;
  }
};

export const withUser = async (
  request: Request,
  handle: (supabase: DatabaseClient, userId: string) => Promise<Response>
): Promise<Response> => {
  const sessionHeaders = new Headers({ "Cache-Control": "private, no-store" });
  let response: Response;

  try {
    if (request.method !== "GET" && isCrossOriginRequest(request)) {
      throw new HttpError(403, "Make changes from the portal.");
    }

    const supabase = await createClient(sessionHeaders);
    const { data, error } = await supabase.auth.getUser();

    if (isAuthServiceUnavailable(error)) {
      throw new HttpError(503, "Sign-in is temporarily unavailable. Please try again.");
    }
    if (error || !data.user) throw new HttpError(401, "Sign in to manage consultations.");

    response = await handle(supabase, data.user.id);
  } catch (error) {
    response = errorResponse(error);
  }

  sessionHeaders.forEach((value, name) => response.headers.set(name, value));
  if (response.status === 503) response.headers.set("Retry-After", "30");

  return response;
};

const errorResponse = (error: unknown): Response => {
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  if (error instanceof ZodError) return json({ error: error.issues[0].message }, 400);
  if (error instanceof PostgrestError && error.code === "23514") {
    return json({ error: "Check your consultation details and choose a future time." }, 400);
  }
  if (error instanceof PostgrestError && error.code === "PT409") return json({ error: error.message }, 409);

  console.error("Consultation request failed", error instanceof Error ? error.name : "Database error");
  return json({ error: "Consultations are unavailable. Please try again." }, 500);
};
