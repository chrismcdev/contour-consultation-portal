import { z } from "zod";

import { changeSchema } from "@/lib/consultations/schema";
import { CONSULTATION_COLUMNS } from "@/lib/supabase/database";
import { HttpError, json, readJson, withUser } from "../http";

type Context = RouteContext<"/api/consultations/[id]">;

const consultationId = async (context: Context): Promise<string> => {
  const { id } = await context.params;
  if (!z.guid().safeParse(id).success) throw new HttpError(404, "Consultation not found.");
  return id;
};

export const PATCH = (request: Request, context: Context): Promise<Response> =>
  withUser(request, async (supabase, userId) => {
    const id = await consultationId(context);
    const { scheduledAt, isComplete } = changeSchema.parse(await readJson(request));

    const { data } = await supabase
      .from("consultations")
      .update({ scheduled_at: scheduledAt, is_complete: isComplete })
      .match({ id, student_id: userId })
      .select(CONSULTATION_COLUMNS)
      .maybeSingle()
      .throwOnError();

    if (!data) throw new HttpError(404, "Consultation not found.");

    return json({ consultation: data });
  });

export const DELETE = (request: Request, context: Context): Promise<Response> =>
  withUser(request, async (supabase, userId) => {
    const id = await consultationId(context);

    const { count } = await supabase
      .from("consultations")
      .delete({ count: "exact" })
      .match({ id, student_id: userId })
      .throwOnError();

    if (!count) throw new HttpError(404, "Consultation not found.");

    return new Response(null, { status: 204 });
  });
