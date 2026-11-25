import { Paper, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCalendarPlus } from "@tabler/icons-react";
import type { Metadata } from "next";
import { ViewTransition, type JSX } from "react";

import { requireAccount } from "@/lib/auth/account";
import { loadStudentConsultationPage } from "@/lib/consultations/list";
import { parseStudentView } from "@/lib/consultations/student";
import { BookingViews } from "./booking-views";
import { StudentBookings } from "./student-bookings";

export const metadata = { title: "My consultations" } satisfies Metadata;

const DashboardPage = async ({ searchParams }: PageProps<"/dashboard">): Promise<JSX.Element> => {
  const [account, params] = await Promise.all([requireAccount(), searchParams]);
  const view = parseStudentView(params.view);
  const bookings = await loadStudentConsultationPage(account, view, params.page);
  const { counts } = bookings;
  const hasBookings = counts.upcoming + counts.history > 0;

  return (
    <ViewTransition default="none" enter="page" exit="page">
      <Stack gap="md">
        {hasBookings ? (
          <BookingViews view={view} counts={counts} />
        ) : (
          <Paper withBorder p="xl">
            <Stack align="center" gap="xs" ta="center">
              <ThemeIcon size={48} radius="xl" variant="light">
                <IconCalendarPlus size={26} aria-hidden="true" />
              </ThemeIcon>
              <Title order={3}>Book your first consultation</Title>
              <Text c="dimmed" size="sm">
                Choose your subjects, preferred campuses and a time to meet.
              </Text>
            </Stack>
          </Paper>
        )}
        <ViewTransition key={view} name="bookings" default="none" share="booking-list">
          <StudentBookings result={bookings} view={view} />
        </ViewTransition>
      </Stack>
    </ViewTransition>
  );
};

export default DashboardPage;
