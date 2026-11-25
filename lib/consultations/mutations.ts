import type { Booking, ConsultationChange } from "@/lib/consultations/schema";

export type ConsultationMutation =
  | { type: "book"; booking: Booking; idempotencyKey: string }
  | { type: "reschedule"; id: string; scheduledAt: string }
  | { type: "setCompletion"; id: string; complete: boolean }
  | { type: "cancel"; id: string };

type WriteResult = { status: "saved" | "missing"; message: string };

export class SessionExpiredError extends Error {}

export const submitConsultationChange = (change: ConsultationMutation): Promise<WriteResult> => {
  const path = "/api/consultations";
  const url = change.type === "book" ? path : `${path}/${change.id}`;

  switch (change.type) {
    case "book":
      return sendChange(url, "POST", "Booking confirmed", change.booking, change.idempotencyKey);
    case "reschedule":
      return sendChange(url, "PATCH", "Consultation rescheduled.", { scheduledAt: change.scheduledAt });
    case "setCompletion": {
      const message = change.complete ? "Consultation marked complete." : "Consultation marked incomplete.";
      return sendChange(url, "PATCH", message, { isComplete: change.complete });
    }
    case "cancel":
      return sendChange(url, "DELETE", "Consultation cancelled.");
  }
};

const sendChange = async (
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  success: string,
  body?: Booking | ConsultationChange,
  idempotencyKey?: string
): Promise<WriteResult> => {
  const headers = new Headers();
  if (body) headers.set("Content-Type", "application/json");
  if (idempotencyKey) headers.set("Idempotency-Key", idempotencyKey);

  const response = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(body)
  }).catch(() => {
    throw new Error("Couldn’t reach the server. Check your connection and try again.");
  });

  if (response.ok) return { status: "saved", message: success };
  if (response.status === 401) throw new SessionExpiredError("Your session has expired.");
  if (response.status === 404 && method !== "POST") {
    return { status: "missing", message: "This consultation is no longer available." };
  }

  const problem: unknown = await response.json().catch(() => null);
  if (typeof problem === "object" && problem && "error" in problem && typeof problem.error === "string") {
    throw new Error(problem.error);
  }

  throw new Error("Couldn’t save this change. Please try again.");
};
