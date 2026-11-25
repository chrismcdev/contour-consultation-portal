import { Badge, Card, CardSection, Group, Stack, Text, Title } from "@mantine/core";
import { IconCalendarEvent, IconMapPin } from "@tabler/icons-react";
import type { JSX, ReactNode } from "react";

import type { Consultation } from "@/lib/consultations/schema";
import { formatCampuses, formatSubjects } from "@/utils/booking-labels";
import styles from "./consultations.module.css";

type BookingRowProps = { consultation: Consultation; when: ReactNode; showCompletion: boolean; children?: ReactNode };

export const BookingRow = ({ consultation, when, showCompletion, children }: BookingRowProps): JSX.Element => {
  const { firstName, lastName, subjects, campuses, reason, isComplete } = consultation;

  return (
    <Card component="li" withBorder radius="md" p="md" className={styles.card}>
      <CardSection withBorder className={styles.section}>
        <Group justify="space-between" align="flex-start" gap="xs">
          <Title order={4}>{formatSubjects(subjects)}</Title>
          {showCompletion && (
            <Badge variant="outline" color="var(--mantine-color-dimmed)">
              {isComplete ? "Complete" : "Incomplete"}
            </Badge>
          )}
        </Group>
        <Stack gap={6} mt="xs">
          <Group gap={6} wrap="nowrap">
            <IconCalendarEvent size={17} aria-hidden="true" />
            <time dateTime={consultation.scheduledAt}>{when}</time>
          </Group>
          <Group gap={6} wrap="nowrap">
            <IconMapPin size={17} aria-hidden="true" />
            <Text size="sm">{formatCampuses(campuses)}</Text>
          </Group>
        </Stack>
      </CardSection>
      <CardSection withBorder className={styles.section}>
        <Text size="sm">
          For {firstName} {lastName}
        </Text>
        <Text size="sm" mt={4} c="dimmed" className={styles.reason}>
          {reason}
        </Text>
      </CardSection>
      {children && <div className={styles.actions}>{children}</div>}
    </Card>
  );
};
