import { ActionIcon, Button, Group, Menu, Modal, Stack, Text } from "@mantine/core";
import { IconCalendarTime, IconCheck, IconDots, IconTrash } from "@tabler/icons-react";
import { useRef, useState, type JSX } from "react";
import { useForm } from "react-hook-form";

import {
  ConsultationForm,
  ConsultationTimeInput,
  consultationTimeRules,
  MutationError
} from "@/components/consultations/forms";
import { useConsultationMutation } from "@/hooks/useConsultationMutation";
import type { Booking, Consultation } from "@/lib/consultations/schema";
import { formatCampuses, formatSubjects } from "@/utils/booking-labels";
import { localDateTime } from "@/utils/dateTime";

type BookingActionProps = {
  consultation: Consultation;
  timeZone: string;
};

type RescheduleFields = Pick<Booking, "scheduledAt">;

const RescheduleForm = ({ consultation, timeZone, close }: BookingActionProps & { close: () => void }): JSX.Element => {
  const originalTime = localDateTime(new Date(consultation.scheduledAt));
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RescheduleFields>({
    progressive: true,
    defaultValues: { scheduledAt: originalTime }
  });
  const { save, pending, error } = useConsultationMutation(close);

  const reschedule = ({ scheduledAt }: RescheduleFields): void => {
    if (scheduledAt === originalTime) return close();

    save({ type: "reschedule", id: consultation.id, scheduledAt: new Date(scheduledAt).toISOString() });
  };

  return (
    <ConsultationForm pending={pending} error={error} onSubmit={handleSubmit(reschedule)} onCancel={close}>
      <ConsultationTimeInput
        {...register("scheduledAt", consultationTimeRules(originalTime))}
        timeZone={timeZone}
        error={errors.scheduledAt?.message}
        rescheduling
      />
    </ConsultationForm>
  );
};

export const BookingActions = ({
  consultation,
  when,
  timeZone
}: BookingActionProps & { when: string }): JSX.Element => {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const moreActions = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);
  const { pending, error, save } = useConsultationMutation(() => setConfirming(false));
  const { id, isComplete } = consultation;
  const bookingLabel = `${formatSubjects(consultation.subjects)} on ${when}`;

  const close = (): void => {
    returnFocus.current = true;
    setEditing(false);
  };

  const restoreFocus = (button: HTMLButtonElement | null): void => {
    if (button && returnFocus.current) {
      returnFocus.current = false;
      button.focus();
    }
  };

  if (editing) return <RescheduleForm consultation={consultation} timeZone={timeZone} close={close} />;

  return (
    <>
      <Group justify="space-between" wrap="nowrap">
        <Button
          ref={restoreFocus}
          aria-label={`Reschedule ${bookingLabel}`}
          variant="light"
          leftSection={<IconCalendarTime size={17} aria-hidden="true" />}
          disabled={pending}
          onClick={() => setEditing(true)}
        >
          Reschedule
        </Button>
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon
              ref={moreActions}
              variant="subtle"
              color="gray"
              size={36}
              disabled={pending}
              aria-label={`More actions for ${bookingLabel}`}
            >
              <IconDots size={20} aria-hidden="true" />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              leftSection={<IconCheck size={16} aria-hidden="true" />}
              onClick={() => save({ type: "setCompletion", id, complete: !isComplete })}
            >
              {isComplete ? "Mark incomplete" : "Mark complete"}
            </Menu.Item>
            <Menu.Item
              color="red"
              leftSection={<IconTrash size={16} aria-hidden="true" />}
              onClick={() => setConfirming(true)}
            >
              Cancel consultation
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
      {!confirming && <MutationError error={error} />}
      <Modal
        opened={confirming}
        onClose={() => setConfirming(false)}
        closeOnClickOutside={!pending}
        closeOnEscape={!pending}
        returnFocus={false}
        onExitTransitionEnd={() => moreActions.current?.focus()}
        title="Cancel this consultation?"
        closeButtonProps={{ "aria-label": "Close cancellation", disabled: pending }}
      >
        <Stack>
          <Text>
            {bookingLabel}
            {consultation.campuses.length > 0 && ` at ${formatCampuses(consultation.campuses)}`}.
          </Text>
          <MutationError error={error} />
          <Group justify="flex-end">
            <Button data-autofocus variant="default" disabled={pending} onClick={() => setConfirming(false)}>
              Keep booking
            </Button>
            <Button color="red" loading={pending} onClick={() => save({ type: "cancel", id })}>
              Cancel consultation
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
