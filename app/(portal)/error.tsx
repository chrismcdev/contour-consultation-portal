"use client";

import type { JSX } from "react";
import Link from "next/link";
import { Button, Group, Stack, Text, Title } from "@mantine/core";

const PortalError = ({ retry }: { retry: () => void }): JSX.Element => (
  <Stack>
    <Title order={2}>Consultations unavailable</Title>
    <Text>We couldn’t load your bookings. Please try again.</Text>
    <Group>
      <Button onClick={retry}>Try again</Button>
      <Button component={Link} href="/dashboard" variant="default">
        My consultations
      </Button>
    </Group>
  </Stack>
);

export default PortalError;
