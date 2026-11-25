"use client";

import { MultiSelect, Pill, SimpleGrid, Textarea, TextInput, type MultiSelectProps } from "@mantine/core";
import partition from "lodash/partition";
import { useRef, useState, type JSX } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { ConsultationForm, ConsultationTimeInput, consultationTimeRules } from "@/components/consultations/forms";
import { useBrowserTimeZone } from "@/hooks/useBrowserTimeZone";
import { useConsultationMutation } from "@/hooks/useConsultationMutation";
import { getEligibleCampuses } from "@/lib/catalog/campuses";
import type { BookingOptions } from "@/lib/catalog/contracts";
import type { Booking } from "@/lib/consultations/schema";

type BookingFormProps = Pick<Booking, "firstName" | "lastName"> & { options: BookingOptions; onBooked: () => void };

const bookingSelectProps = (focusInput: () => void): MultiSelectProps => ({
  withAsterisk: true,
  "aria-required": true,
  errorProps: { role: "alert" },
  comboboxProps: { withinPortal: false },
  renderPill: ({ value, onRemove, disabled }) => (
    <Pill
      withRemoveButton
      disabled={disabled}
      onRemove={() => {
        focusInput();
        onRemove?.();
      }}
      removeButtonProps={{ "aria-label": `Remove ${value}`, "aria-hidden": false, tabIndex: 0, w: 24, h: 24 }}
      radius="sm"
      h="auto"
      style={{ flex: "0 1 auto", whiteSpace: "normal", overflowWrap: "anywhere" }}
    >
      {value}
    </Pill>
  )
});

export const BookingForm = ({ options, firstName, lastName, onBooked }: BookingFormProps): JSX.Element => {
  const timeZone = useBrowserTimeZone();
  const [campusNotice, setCampusNotice] = useState("");
  const lastSubmission = useRef<{ payload: string; key: string } | null>(null);

  const { register, control, getValues, setValue, setFocus, clearErrors, handleSubmit, reset, formState } =
    useForm<Booking>({
      progressive: true,
      values: { firstName, lastName, subjects: [], campuses: [], reason: "", scheduledAt: "" },
      resetOptions: { keepDirtyValues: true }
    });
  const { errors } = formState;
  void formState.dirtyFields;
  const { save, pending, error } = useConsultationMutation(() => {
    lastSubmission.current = null;
    reset(undefined, { keepDirtyValues: false });
    setCampusNotice("");
    onBooked();
  });

  const subjects = useWatch({ control, name: "subjects", defaultValue: [] });
  const campuses = getEligibleCampuses(options, subjects);
  const subjectOptions = Object.entries(options).map(([value, locations]) => ({
    value,
    label: value,
    disabled: subjects.length > 0 && !subjects.includes(value) && !locations.some(campus => campuses.includes(campus))
  }));

  const updateCampuses = (nextSubjects: string[]): void => {
    const available = getEligibleCampuses(options, nextSubjects);
    const [retained, removed] = partition(getValues("campuses"), campus => available.includes(campus));

    setValue("campuses", available.length === 1 ? available : retained, { shouldDirty: true });
    clearErrors("campuses");
    setCampusNotice(
      removed.length && nextSubjects.length
        ? `Removed ${removed.join(", ")} to keep only campuses offering every selected subject.`
        : ""
    );
  };

  const textField = (name: "firstName" | "lastName" | "reason", label: string, limit: number) => ({
    ...register(name, {
      setValueAs: (value: string) => value.trim(),
      required: `Enter a ${label}.`,
      maxLength: { value: limit, message: `Use ${limit} characters or fewer.` }
    }),
    error: errors[name]?.message
  });

  const book = (values: Booking): void => {
    const booking = { ...values, scheduledAt: new Date(values.scheduledAt).toISOString() };
    const payload = JSON.stringify(booking);
    if (lastSubmission.current?.payload !== payload) {
      lastSubmission.current = { payload, key: crypto.randomUUID() };
    }
    save({ type: "book", booking, idempotencyKey: lastSubmission.current.key });
  };

  return (
    <ConsultationForm pending={pending} error={error} onSubmit={event => handleSubmit(book)(event)}>
      <Controller
        control={control}
        name="subjects"
        rules={{
          required: "Choose at least one subject.",
          validate: values => getEligibleCampuses(options, values).length > 0 || "Choose subjects that share a campus."
        }}
        render={({ field, fieldState }) => (
          <MultiSelect
            {...bookingSelectProps(() => setFocus("subjects"))}
            {...field}
            data-autofocus
            label="Subjects"
            description="Choose the topics to cover in this consultation."
            placeholder="Search subjects"
            data={subjectOptions}
            nothingFoundMessage="No subjects match your search."
            error={fieldState.error?.message}
            onChange={values => {
              field.onChange(values);
              updateCampuses(values);
            }}
          />
        )}
      />
      <Controller
        name="campuses"
        control={control}
        disabled={!campuses.length}
        rules={{
          required: "Choose at least one campus.",
          validate: values =>
            values.every(campus => campuses.includes(campus)) || "Choose campuses that offer every selected subject."
        }}
        render={({ field, fieldState }) => (
          <MultiSelect
            {...bookingSelectProps(() => setFocus("campuses"))}
            {...field}
            label="Preferred campuses"
            description={
              <span role="status">
                {campusNotice || "Choose any locations you could attend. Each offers all your selected subjects."}
              </span>
            }
            placeholder={subjects.length ? "Search campuses" : "Choose a subject first"}
            data={campuses}
            onChange={values => {
              field.onChange(values);
              setCampusNotice("");
            }}
            nothingFoundMessage="No campuses match your search."
            error={fieldState.error?.message}
          />
        )}
      />

      <ConsultationTimeInput
        {...register("scheduledAt", consultationTimeRules())}
        timeZone={timeZone}
        error={errors.scheduledAt?.message}
      />

      <Textarea {...textField("reason", "reason for consultation", 1000)} label="Reason for consultation" rows={3} />

      <SimpleGrid cols={{ base: 1, sm: 2 }} verticalSpacing="lg">
        <TextInput
          {...textField("firstName", "first name", 80)}
          id="first-name"
          label="First name"
          autoComplete="given-name"
          defaultValue={firstName}
        />
        <TextInput
          {...textField("lastName", "last name", 80)}
          label="Last name"
          autoComplete="family-name"
          defaultValue={lastName}
        />
      </SimpleGrid>
    </ConsultationForm>
  );
};
