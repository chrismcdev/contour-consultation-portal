"use client";

import { Badge, Center, Group, ScrollArea, Stack, Table, Text, UnstyledButton } from "@mantine/core";
import { IconChevronDown, IconChevronUp, IconSelector } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import type { JSX } from "react";

import { useBrowserTimeZone } from "@/hooks/useBrowserTimeZone";
import { ADMIN_COLUMNS, adminHref, type AdminFilters } from "@/lib/consultations/admin";
import type { Consultation } from "@/lib/consultations/schema";
import { formatCampuses, formatSubjects } from "@/utils/booking-labels";
import { createDateTimeFormatter } from "@/utils/dateTime";
import styles from "./table.module.css";

type TableProps = { consultations: Consultation[]; filters: AdminFilters };

export const ConsultationsTable = ({ consultations, filters }: TableProps): JSX.Element => {
  const router = useRouter();
  const timeZone = useBrowserTimeZone();
  const formatter = createDateTimeFormatter(timeZone);

  return (
    <Stack gap="xs">
      {consultations.length > 0 && (
        <Text size="xs" c="dimmed">
          Times shown in {timeZone}.
        </Text>
      )}
      <ScrollArea
        type="auto"
        viewportProps={{ tabIndex: 0, role: "region", "aria-label": "Scrollable bookings table" }}
      >
        <Table
          horizontalSpacing="md"
          verticalSpacing="sm"
          miw={820}
          aria-labelledby="bookings-title"
          className={styles.table}
        >
          <Table.Thead>
            <Table.Tr>
              {ADMIN_COLUMNS.map(column => {
                const sorted = filters.sort.key === column.key;
                const descending = sorted && !filters.descending;
                const Icon = sorted ? (filters.descending ? IconChevronDown : IconChevronUp) : IconSelector;

                return (
                  <Table.Th
                    key={column.key}
                    scope="col"
                    className={styles.th}
                    aria-sort={sorted ? (filters.descending ? "descending" : "ascending") : undefined}
                  >
                    <UnstyledButton
                      type="button"
                      className={styles.control}
                      aria-label={`Sort by ${column.label.toLowerCase()}, ${descending ? "descending" : "ascending"}`}
                      onClick={() =>
                        router.push(adminHref({ ...filters, sort: column, descending }), { scroll: false })
                      }
                    >
                      <Group justify="space-between" gap="xs" wrap="nowrap">
                        <Text fw={600} size="sm">
                          {column.label}
                        </Text>
                        <Center className={styles.icon}>
                          <Icon size={16} stroke={1.5} aria-hidden="true" />
                        </Center>
                      </Group>
                    </UnstyledButton>
                  </Table.Th>
                );
              })}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {consultations.map(({ id, firstName, lastName, subjects, campuses, scheduledAt, reason, isComplete }) => (
              <Table.Tr key={id}>
                <Table.Td>
                  <time dateTime={scheduledAt}>{formatter.format(new Date(scheduledAt))}</time>
                </Table.Td>
                <Table.Td>
                  {firstName} {lastName}
                </Table.Td>
                <Table.Td>
                  <Text fw={600} size="sm">
                    {formatSubjects(subjects)}
                  </Text>
                  <Text size="xs" c="dimmed" className={styles.reason}>
                    {reason}
                  </Text>
                </Table.Td>
                <Table.Td>{formatCampuses(campuses)}</Table.Td>
                <Table.Td>
                  <Badge color={isComplete ? "gray" : "blue"} variant="light" tt="none">
                    {isComplete ? "Complete" : "Incomplete"}
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
            {consultations.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={ADMIN_COLUMNS.length}>
                  <Text fw={500} py="xl" className={styles.empty}>
                    {filters.search ? "No matching consultations." : "No student bookings yet."}
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Stack>
  );
};
