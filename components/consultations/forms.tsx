import { Alert, Button, Fieldset, Group, Stack, TextInput } from "@mantine/core";
import { IconAlertCircle, IconArrowRight } from "@tabler/icons-react";
import type { JSX, PropsWithChildren, SubmitEventHandler } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { InternalLink } from "@/components/internal-link";
import { SessionExpiredError } from "@/lib/consultations/mutations";
import { isFutureLocalTime, localDateTime } from "@/utils/dateTime";

export const MutationError = ({ error }: { error: Error | null }): JSX.Element | null =>
  error && (
    <Alert color="red" icon={<IconAlertCircle aria-hidden="true" size={18} />}>
      {error.message}{" "}
      {error instanceof SessionExpiredError && <InternalLink href="/auth/login">Sign in again</InternalLink>}
    </Alert>
  );

export const consultationTimeRules = (originalTime?: string) => ({
  required: "Choose a date and time.",
  validate: (value: string): true | string =>
    value === originalTime || isFutureLocalTime(value) || "Choose a valid future date and time in your time zone."
});

type TimeInputProps = UseFormRegisterReturn<"scheduledAt"> & {
  timeZone: string;
  rescheduling?: boolean;
  error?: string;
};

export const ConsultationTimeInput = ({ timeZone, rescheduling, ...input }: TimeInputProps): JSX.Element => (
  <TextInput
    {...input}
    onFocus={event => {
      event.currentTarget.min = localDateTime(new Date());
    }}
    type="datetime-local"
    autoFocus={rescheduling}
    label={rescheduling ? "New date and time" : "Date and time"}
    description={`Time zone · ${timeZone}`}
  />
);

type FormProps = PropsWithChildren<{
  pending: boolean;
  error: Error | null;
  onSubmit: SubmitEventHandler<HTMLFormElement>;
  onCancel?: () => void;
}>;

export const ConsultationForm = ({ children, pending, error, onSubmit, onCancel }: FormProps): JSX.Element => (
  <form
    aria-label={onCancel ? "Reschedule consultation" : "Book a consultation"}
    method="post"
    onSubmit={onSubmit}
    noValidate
  >
    <Fieldset variant="unstyled" disabled={pending}>
      <Stack gap={onCancel ? "md" : "lg"}>
        {children}
        <MutationError error={error} />

        <Group>
          <Button
            type="submit"
            loading={pending}
            fullWidth={!onCancel}
            rightSection={!onCancel && <IconArrowRight aria-hidden="true" size={17} />}
          >
            {onCancel ? "Save new time" : "Book consultation"}
          </Button>
          {onCancel && (
            <Button type="button" variant="default" onClick={onCancel}>
              Go back
            </Button>
          )}
        </Group>
      </Stack>
    </Fieldset>
  </form>
);
