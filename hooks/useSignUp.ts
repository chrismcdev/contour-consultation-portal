"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { authErrorMessage, type AccountSubmission, type SignUpFields } from "@/lib/auth/form";

export const useSignUp = (): AccountSubmission<SignUpFields> => {
  const router = useRouter();
  const form = useForm<SignUpFields>({ progressive: true });

  const onSubmit = form.handleSubmit(async ({ email, password, ...profile }) => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const { data, error } = await createClient().auth.signUp({
        email,
        password,
        options: { data: { ...profile, school: profile.school.trim() } }
      });

      if (error) throw error;
      if (!data.session) throw new Error("We couldn’t start your session. Please contact the site administrator.");

      router.replace("/dashboard");
    } catch (error) {
      form.setError("root", { message: authErrorMessage(error) });
    }
  });

  return { form, onSubmit };
};
