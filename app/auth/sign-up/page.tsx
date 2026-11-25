"use client";

import type { JSX } from "react";
import { Button, Select, SimpleGrid, Stack, TextInput } from "@mantine/core";
import { FormProvider, useController } from "react-hook-form";

import { AccountForm, EmailField } from "@/components/account-form";
import { useYearLevels } from "@/hooks/useCatalog";
import { useSignUp } from "@/hooks/useSignUp";
import { MobilePhoneField } from "./mobile-phone-field";
import { SignUpPasswordField } from "./password-field";
import { SchoolField } from "./school-field";

const nameRules = {
  setValueAs: (value: string) => value.trim(),
  maxLength: { value: 80, message: "Use 80 characters or fewer." }
};

const SignUpPage = (): JSX.Element => {
  const { form, onSubmit } = useSignUp();
  const {
    register,
    control,
    formState: { errors }
  } = form;

  const { data: years = [], isFetching, refetch } = useYearLevels();
  const unavailable = !years.length && !isFetching;
  const { field: year } = useController({
    control,
    name: "yearLevel",
    defaultValue: "",
    rules: {
      required: "Choose your year level.",
      validate: value => years.includes(value) || "Choose a year level from the list."
    }
  });

  return (
    <FormProvider {...form}>
      <AccountForm onSubmit={onSubmit} submitLabel="Create account">
        <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm" verticalSpacing="lg">
          <TextInput
            {...register("firstName", { ...nameRules, required: "Enter your first name." })}
            id="firstName"
            label="First name"
            size="md"
            autoComplete="given-name"
            error={errors.firstName?.message}
            errorProps={{ role: "alert" }}
          />

          <TextInput
            {...register("lastName", { ...nameRules, required: "Enter your last name." })}
            id="lastName"
            label="Last name"
            size="md"
            autoComplete="family-name"
            error={errors.lastName?.message}
            errorProps={{ role: "alert" }}
          />
        </SimpleGrid>

        <SchoolField control={control} />

        <Stack gap="xs">
          <Select
            {...year}
            id="yearLevel"
            label="Year level"
            size="md"
            required
            disabled={!years.length}
            data={years}
            value={year.value || null}
            placeholder={!years.length && isFetching ? "Loading year levels…" : "Select year level"}
            nothingFoundMessage="No year levels match your search."
            error={unavailable ? "Year levels could not be loaded." : errors.yearLevel?.message}
            errorProps={{ role: "alert" }}
          />
          {unavailable && (
            <Button type="button" variant="default" onClick={() => refetch()}>
              Retry year levels
            </Button>
          )}
        </Stack>

        <MobilePhoneField />
        <EmailField />
        <SignUpPasswordField />
      </AccountForm>
    </FormProvider>
  );
};

export default SignUpPage;
