"use client";

import { PasswordInput, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import dynamic from "next/dynamic";
import { useEffect, type JSX } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import type { SignUpFields } from "@/lib/auth/form";

const UnavailableStrength = (): JSX.Element => (
  <Text size="xs" c="dimmed">
    Strength estimate unavailable.
  </Text>
);

const StrengthMeter = dynamic(() => import("./password-strength").catch(() => UnavailableStrength), { ssr: false });

export const SignUpPasswordField = (): JSX.Element => {
  const {
    control,
    register,
    formState: { errors }
  } = useFormContext<SignUpFields>();
  const [password = "", firstName = "", lastName = "", email = ""] = useWatch({
    control,
    name: ["password", "firstName", "lastName", "email"]
  });
  const [settledPassword, , { flush }] = useDebouncedValue(password, 220);

  useEffect(() => {
    if (!password) flush();
  }, [password, flush]);

  return (
    <div>
      <PasswordInput
        {...register("password", {
          required: "Enter your password.",
          minLength: { value: 8, message: "Use at least 8 characters." }
        })}
        id="password"
        label="Password"
        size="md"
        description="Use at least 8 characters. Several unrelated words make a good passphrase."
        autoComplete="new-password"
        aria-details={password ? "password-strength" : undefined}
        error={errors.password?.message}
        errorProps={{ role: "alert" }}
        visibilityToggleButtonProps={{ "aria-label": "Toggle password visibility" }}
        visibilityToggleFocusable
      />

      <div id="password-strength" role="status" aria-atomic="true" aria-busy={password !== settledPassword}>
        {password && settledPassword && (
          <StrengthMeter password={settledPassword} firstName={firstName} lastName={lastName} email={email} />
        )}
      </div>
    </div>
  );
};
