import "server-only";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";

import { isAuthServiceUnavailable } from "@/lib/supabase/auth-errors";
import type { DatabaseClient } from "@/lib/supabase/database";
import { createClient } from "@/lib/supabase/server";

export type PortalAccount = { supabase: DatabaseClient; user: User; firstName: string; lastName: string };

const profileName = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

export const requireAccount = cache(async (): Promise<PortalAccount> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (isAuthServiceUnavailable(error)) {
    throw new Error("The session could not be verified.");
  }

  const { user } = data;
  if (!user) redirect("/auth/login");

  const { firstName, lastName } = user.user_metadata;
  return { supabase, user, firstName: profileName(firstName), lastName: profileName(lastName) };
});

export const hasAdminRole = cache(async (supabase: DatabaseClient, userId: string): Promise<boolean> => {
  const { data } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle()
    .throwOnError();
  return data !== null;
});
