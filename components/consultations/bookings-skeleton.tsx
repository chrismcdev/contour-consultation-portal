import { Card, CardSection, Group, Skeleton, Stack, VisuallyHidden } from "@mantine/core";
import type { JSX } from "react";

import styles from "./consultations.module.css";

export const BookingsSkeleton = (): JSX.Element => (
  <div role="status">
    <VisuallyHidden>Loading consultations…</VisuallyHidden>
    <ul aria-hidden="true" className={styles.list}>
      <Card component="li" withBorder radius="md" p="md" className={styles.card}>
        <CardSection withBorder className={styles.section}>
          <Skeleton width="55%" height={20} />
          <Stack gap={8} mt="sm">
            <Skeleton width="65%" height={14} />
            <Skeleton width="45%" height={14} />
          </Stack>
        </CardSection>
        <CardSection withBorder className={styles.section}>
          <Skeleton width="40%" height={14} />
          <Skeleton width="70%" height={14} mt="xs" />
        </CardSection>
        <Group justify="space-between" className={styles.actions}>
          <Skeleton width={136} height={36} />
          <Skeleton width={36} height={36} />
        </Group>
      </Card>
    </ul>
  </div>
);
