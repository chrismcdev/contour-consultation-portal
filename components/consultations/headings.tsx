import { Badge, Group, Skeleton, Title, VisuallyHidden } from "@mantine/core";
import type { JSX, PropsWithChildren } from "react";

export const BookingHeading = ({ children }: PropsWithChildren): JSX.Element => (
  <Group justify="space-between">
    <Title id="my-consultations" order={2}>
      My consultations
    </Title>
    {children}
  </Group>
);

export const AdminHeading = ({ total }: { total?: number }): JSX.Element => (
  <Group gap="xs">
    <Title id="bookings-title" order={2}>
      All consultations
    </Title>
    <Badge variant="light" miw={40}>
      {total === undefined ? (
        <Skeleton component="span" display="block" width={14} height={8} aria-hidden="true" />
      ) : (
        total
      )}
      <VisuallyHidden> matching consultations</VisuallyHidden>
    </Badge>
  </Group>
);
