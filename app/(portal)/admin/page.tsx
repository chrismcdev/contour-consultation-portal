import { Button, Group, Paper, Stack, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import type { Metadata } from "next";
import Form from "next/form";
import { redirect } from "next/navigation";
import { ViewTransition, type JSX } from "react";

import { BookingPagination } from "@/components/consultations/booking-pagination";
import { AdminHeading } from "@/components/consultations/headings";
import { InternalLink } from "@/components/internal-link";
import { hasAdminRole, requireAccount } from "@/lib/auth/account";
import { adminHref, MAX_ADMIN_SEARCH_LENGTH, parseAdminFilters } from "@/lib/consultations/admin";
import { loadAdminConsultationPage } from "@/lib/consultations/list";
import { ConsultationsTable } from "./consultations-table";
import styles from "./table.module.css";

export const metadata = { title: "All consultations" } satisfies Metadata;

const AdminPage = async ({ searchParams }: PageProps<"/admin">): Promise<JSX.Element> => {
  const account = await requireAccount();
  if (!(await hasAdminRole(account.supabase, account.user.id))) redirect("/dashboard");

  const params = await searchParams;
  const filters = parseAdminFilters(params);
  const { consultations, total, page, pageSize } = await loadAdminConsultationPage(account, params.page, filters);

  return (
    <ViewTransition default="none" enter="page" exit="page">
      <Stack gap="md">
        <AdminHeading total={total} />
        <Paper withBorder p={{ base: "md", sm: "xl" }} className={styles.panel}>
          <Stack gap="lg">
            <Form action="/admin" scroll={false} role="search" aria-label="Search consultations">
              <Group gap="xs">
                <TextInput
                  key={filters.search}
                  type="search"
                  name="q"
                  defaultValue={filters.search}
                  maxLength={MAX_ADMIN_SEARCH_LENGTH}
                  placeholder="Student, subject, campus or reason"
                  aria-label="Search consultations"
                  className={styles.search}
                  leftSection={<IconSearch size={16} stroke={1.5} aria-hidden="true" />}
                />
                {filters.sort.key !== "date" && <input type="hidden" name="sort" value={filters.sort.key} />}
                {filters.descending && <input type="hidden" name="dir" value="desc" />}
                <Button type="submit" variant="light">
                  Search
                </Button>
                {filters.search && (
                  <InternalLink href={adminHref({ ...filters, search: "" })} scroll={false} size="sm">
                    Clear search
                  </InternalLink>
                )}
              </Group>
            </Form>
            <ConsultationsTable consultations={consultations} filters={filters} />
            <BookingPagination path={adminHref(filters)} page={page} pages={Math.ceil(total / pageSize)} />
          </Stack>
        </Paper>
      </Stack>
    </ViewTransition>
  );
};

export default AdminPage;
