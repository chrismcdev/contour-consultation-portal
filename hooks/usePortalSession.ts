"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export const usePortalSession = (userId: string): boolean => {
  const router = useRouter();
  const [current, setCurrent] = useState(true);

  useEffect(() => {
    const { auth } = createClient();
    let active = true;
    let observed: string | undefined = userId;

    const sync = (id?: string): void => {
      if (!active || id === observed) return;
      observed = id;
      setCurrent(id === userId);
      router.refresh();
    };

    const check = async (): Promise<void> => {
      const { data, error } = await auth.getSession();
      if (!error) sync(data.session?.user.id);
    };
    const {
      data: { subscription }
    } = auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") sync(session?.user.id);
    });

    const cookies = window.cookieStore;
    cookies?.addEventListener("change", check);
    window.addEventListener("focus", check);
    window.addEventListener("pageshow", check);
    void check();

    return () => {
      active = false;
      subscription.unsubscribe();
      cookies?.removeEventListener("change", check);
      window.removeEventListener("focus", check);
      window.removeEventListener("pageshow", check);
    };
  }, [router, userId]);

  return current;
};
