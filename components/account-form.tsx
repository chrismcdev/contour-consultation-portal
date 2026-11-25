import { Button, Stack, Text, TextInput } from "@mantine/core";
import type { FormEventHandler, JSX, PropsWithChildren } from "react";
import { useFormContext } from "react-hook-form";
import { regexes } from "zod";

import type { Credentials } from "@/lib/auth/form";

type AccountFormProps = PropsWithChildren<{
  onSubmit: FormEventHandler<HTMLFormElement>;
  submitLabel: string;
}>;

export const EmailField = (): JSX.Element => {
  const {
    register,
    formState: { errors }
  } = useFormContext<Credentials>();

  return (
    <TextInput
      {...register("email", {
        required: "Enter your email address.",
        setValueAs: (value: string) => value.trim(),
        validate: value => regexes.html5Email.test(value) || "Enter a valid email address.",
        maxLength: { value: 254, message: "Use an email address of 254 characters or fewer." }
      })}
      id="email"
      type="email"
      size="md"
      label="Email address"
      autoComplete="email"
      error={errors.email?.message}
      errorProps={{ role: "alert" }}
    />
  );
};

export const AccountForm = ({ onSubmit, submitLabel, children }: AccountFormProps): JSX.Element => {
  const {
    formState: { errors, isSubmitting, isSubmitSuccessful }
  } = useFormContext<Credentials>();
  const pending = isSubmitting || isSubmitSuccessful;

  return (
    <form method="post" onSubmit={onSubmit} noValidate aria-busy={pending}>
      <Stack gap="lg">
        {children}
        {errors.root?.message && (
          <Text role="alert" c="var(--mantine-color-error)">
            {errors.root.message}
          </Text>
        )}
        <Button type="submit" size="md" mt="xs" fullWidth loading={pending}>
          {submitLabel}
        </Button>
      </Stack>
    </form>
  );
};
