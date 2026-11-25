import { createBrowserClient } from "@supabase/ssr";

import type { Database, DatabaseClient } from "./database";
import { HAS_SUPABASE_CONFIG, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/config/supabase";

export const createClient = (): DatabaseClient => {
  if (!HAS_SUPABASE_CONFIG) throw new Error("Set up Supabase using the project README to access your account.");
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
};
