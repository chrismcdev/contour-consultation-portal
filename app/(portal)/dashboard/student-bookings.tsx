"use client";

import { Group, Paper, Stack, Text, Title } from "@mantine/core";
import type { JSX } from "react";

import { BookingPagination } from "@/components/consultations/booking-pagination";
import { BookingRow } from "@/components/consultations/booking-row";
import styles from "@/components/consultations/consultations.module.css";
import { InternalLink } from "@/components/internal-link";
import { useBrowserTimeZone } from "@/hooks/useBrowserTimeZone";
import { studentHref, type StudentConsultationPage, type StudentView } from "@/lib/consultations/student";
import { createDateTimeFormatter } from "@/utils/dateTime";
import { BookingActions } from "./booking-actions";

type StudentBookingsProps = { result: StudentConsultationPage; view: StudentView };

export const StudentBookings = ({ result, view }: StudentBookingsProps): JSX.Element => {
  const timeZone = useBrowserTimeZone();
  const dateTime = createDateTimeFormatter(timeZone);
  const { consultations, total, page, pageSize, counts } = result;
  const upcoming = view === "upcoming";

  return (
    <div>
      {total === 0 && counts[upcoming ? "history" : "upcoming"] > 0 && (
        <Paper withBorder p="xl" ta="center">
          <Title order={3}>{upcoming ? "No upcoming consultations" : "No past or completed consultations"}</Title>
          <InternalLink
            href={studentHref(upcoming ? "history" : "upcoming")}
            size="sm"
            mt="xs"
            display="inline-block"
            scroll={false}
          >
            {upcoming ? "View history" : "View upcoming consultations"}
          </InternalLink>
        </Paper>
      )}
      {total > 0 && (
        <Stack gap="md">
          <Group justify="space-between" gap="xs">
            <Title order={3} size="h4">
              {upcoming ? "Upcoming consultations" : "Past and completed consultations"}
            </Title>
            <Text size="sm" c="dimmed">
              Times shown in {timeZone}
            </Text>
          </Group>
          <ul className={styles.list} aria-label="Consultations">
            {consultations.map(consultation => {
              const when = dateTime.format(new Date(consultation.scheduledAt));
              return (
                <BookingRow key={consultation.id} consultation={consultation} when={when} showCompletion={!upcoming}>
                  <BookingActions consultation={consultation} when={when} timeZone={timeZone} />
                </BookingRow>
              );
            })}
          </ul>
          <BookingPagination page={page} pages={Math.ceil(total / pageSize)} path={studentHref(view)} />
        </Stack>
      )}
    </div>
  );
};
