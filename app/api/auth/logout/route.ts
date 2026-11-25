import { isCrossOriginRequest } from "@/app/api/origin";
import { createClient } from "@/lib/supabase/server";

export const POST = async (request: Request): Promise<Response> => {
  if (isCrossOriginRequest(request)) {
    return new Response("Sign out from the portal.", { status: 403 });
  }

  const headers = new Headers({ Location: "/auth/login", "Cache-Control": "private, no-store" });
  try {
    const supabase = await createClient(headers);
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) throw error;
  } catch {
    headers.set("Location", "/auth/logout?failed=1");
  }

  return new Response(null, { status: 303, headers });
};
