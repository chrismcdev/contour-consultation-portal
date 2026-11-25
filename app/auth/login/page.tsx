"use client";

import { PasswordInput } from "@mantine/core";
import type { JSX } from "react";
import { FormProvider } from "react-hook-form";

import { AccountForm, EmailField } from "@/components/account-form";
import { useLogin } from "@/hooks/useLogin";

const LoginPage = (): JSX.Element => {
  const { form, onSubmit } = useLogin();
  const {
    register,
    formState: { errors }
  } = form;

  return (
    <FormProvider {...form}>
      <AccountForm onSubmit={onSubmit} submitLabel="Sign in">
        <EmailField />
        <PasswordInput
          {...register("password", { required: "Enter your password." })}
          id="password"
          label="Password"
          size="md"
          autoComplete="current-password"
          error={errors.password?.message}
          errorProps={{ role: "alert" }}
          visibilityToggleButtonProps={{ "aria-label": "Toggle password visibility" }}
          visibilityToggleFocusable
        />
      </AccountForm>
    </FormProvider>
  );
};

export default LoginPage;
