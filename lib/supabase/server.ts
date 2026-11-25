import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database, DatabaseClient } from "./database";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/config/supabase";

export const createClient = async (responseHeaders?: Headers): Promise<DatabaseClient> => {
  const store = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (updates, cacheHeaders) => {
        if (!responseHeaders) return;

        Object.entries(cacheHeaders).forEach(([name, value]) => responseHeaders.set(name, value));
        updates.forEach(({ name, value, options }) => store.set(name, value, options));
      }
    }
  });
};
