"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { authErrorMessage, type AccountSubmission, type Credentials } from "@/lib/auth/form";

export const useLogin = (): AccountSubmission<Credentials> => {
  const router = useRouter();
  const form = useForm<Credentials>({ progressive: true });

  const onSubmit = form.handleSubmit(async credentials => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const { error } = await createClient().auth.signInWithPassword(credentials);
      if (error) throw error;

      router.replace("/dashboard");
    } catch (error) {
      form.setError("root", { message: authErrorMessage(error) });
    }
  });

  return { form, onSubmit };
};
