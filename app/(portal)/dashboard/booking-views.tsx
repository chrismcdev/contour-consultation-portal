"use client";

import { Badge, Button, Group } from "@mantine/core";
import Link from "next/link";
import type { JSX } from "react";

import { studentHref, type StudentConsultationPage, type StudentView } from "@/lib/consultations/student";

const VIEWS = [
  ["upcoming", "Upcoming"],
  ["history", "History"]
] as const;

export const BookingViews = ({
  view,
  counts
}: Pick<StudentConsultationPage, "counts"> & { view: StudentView }): JSX.Element => (
  <Group component="nav" aria-label="Consultation views" gap={4}>
    {VIEWS.map(([key, label]) => (
      <Button
        key={key}
        component={Link}
        href={studentHref(key)}
        scroll={false}
        aria-current={key === view ? "page" : undefined}
        variant={key === view ? "light" : "subtle"}
        color={key === view ? undefined : "gray"}
        px="xs"
        rightSection={
          <Badge size="sm" variant="default">
            {counts[key]}
          </Badge>
        }
      >
        {label}
      </Button>
    ))}
  </Group>
);
