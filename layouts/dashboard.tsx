"use client";

import { Group, Stack, Text, Title } from "@mantine/core";
import { IconArrowsExchange } from "@tabler/icons-react";
import { useSelectedLayoutSegment } from "next/navigation";
import { Suspense, type JSX, type PropsWithChildren } from "react";

import { BookingDialog } from "@/app/(portal)/dashboard/booking-dialog";
import { AppearanceMenu } from "@/components/appearance-menu";
import { BookingFeedback } from "@/components/consultations/booking-feedback";
import { BookingsSkeleton } from "@/components/consultations/bookings-skeleton";
import { AdminHeading, BookingHeading } from "@/components/consultations/headings";
import { InternalLink } from "@/components/internal-link";
import { LogoutButton } from "@/components/logout-button";
import { usePortalSession } from "@/hooks/usePortalSession";

type DashboardLayoutProps = PropsWithChildren<{
  userId: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}>;

export const DashboardLayout = ({
  userId,
  firstName,
  lastName,
  isAdmin,
  children
}: DashboardLayoutProps): JSX.Element => {
  const currentSession = usePortalSession(userId);
  const adminView = useSelectedLayoutSegment() === "admin" && isAdmin;
  if (!currentSession) return <Text role="status">Updating session…</Text>;

  return (
    <>
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Title order={1} fz={{ base: "h2", sm: "h1" }} style={{ overflowWrap: "anywhere" }}>
            {firstName ? `Welcome ${firstName}` : "Welcome"}
          </Title>
          <Group gap="xs" wrap="nowrap">
            <AppearanceMenu />
            <LogoutButton variant="default" />
          </Group>
        </Group>
        {isAdmin && (
          <InternalLink href={adminView ? "/dashboard" : "/admin"} size="sm" w="fit-content">
            <Group component="span" gap={5}>
              <IconArrowsExchange size={16} aria-hidden="true" />
              {adminView ? "My consultations" : "All student bookings"}
            </Group>
          </InternalLink>
        )}
      </Stack>
      <BookingFeedback active={!adminView}>
        <Stack component="section" aria-labelledby={adminView ? "bookings-title" : "my-consultations"} gap="md">
          {!adminView && (
            <BookingHeading>
              <BookingDialog firstName={firstName} lastName={lastName} />
            </BookingHeading>
          )}
          <Suspense fallback={adminView ? <AdminHeading /> : <BookingsSkeleton />}>{children}</Suspense>
        </Stack>
      </BookingFeedback>
    </>
  );
};
