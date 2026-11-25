import type { AuthError } from "@supabase/supabase-js";

export const isAuthServiceUnavailable = (error: AuthError | null): boolean => {
  if (!error) return false;

  const { status } = error;
  return !status || status === 408 || status === 429 || status >= 500;
};
