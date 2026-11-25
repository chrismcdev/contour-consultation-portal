import "server-only";
import { redirect } from "next/navigation";

import type { PortalAccount } from "@/lib/auth/account";
import { CONSULTATION_COLUMNS, type DatabaseClient } from "@/lib/supabase/database";
import { adminHref, type AdminFilters } from "./admin";
import type { ConsultationPage, ConsultationScope } from "./schema";
import { studentHref, type StudentConsultationPage, type StudentView } from "./student";

const PAGE_SIZE = 12;
const SEARCH_COLUMNS = ["first_name", "last_name", "subject", "campus", "reason"] as const;

const selectConsultations = (supabase: DatabaseClient, head = false) =>
  supabase.from("consultations").select(CONSULTATION_COLUMNS, { count: "exact", head });

type ConsultationQuery = ReturnType<typeof selectConsultations>;

export const parsePage = (value: unknown): number | null => {
  if (value === undefined || value === null) return 1;
  if (typeof value !== "string" || !/^[1-9]\d{0,6}$/.test(value)) return null;

  const page = Number(value);
  return page <= 1_000_000 ? page : null;
};

const readPage = async (query: ConsultationQuery, page: number): Promise<ConsultationPage | null> => {
  const offset = (page - 1) * PAGE_SIZE;
  const { data, count, error } = await query.order("id").range(offset, offset + PAGE_SIZE - 1);

  if (page > 1 && (error?.code === "PGRST103" || data?.length === 0)) return null;
  if (error) throw error;

  return { consultations: data, total: count ?? 0, page, pageSize: PAGE_SIZE };
};

const studentQuery = (account: PortalAccount, view: StudentView, asOf: string, head = false): ConsultationQuery => {
  const query = selectConsultations(account.supabase, head).eq("student_id", account.user.id);
  return view === "upcoming"
    ? query.eq("is_complete", false).gte("scheduled_at", asOf)
    : query.or(`is_complete.eq.true,scheduled_at.lt.${asOf}`);
};

export const loadStudentConsultationPage = async (
  account: PortalAccount,
  view: StudentView,
  requestedPage: string | string[] | undefined
): Promise<StudentConsultationPage> => {
  const path = studentHref(view);
  const page = parsePage(requestedPage) ?? redirect(path);
  const upcoming = view === "upcoming";
  const asOf = new Date().toISOString();
  const rows = studentQuery(account, view, asOf).order("scheduled_at", { ascending: upcoming });
  const other = studentQuery(account, upcoming ? "history" : "upcoming", asOf, true);

  const [result, { count }] = await Promise.all([readPage(rows, page), other.throwOnError()]);
  if (!result) redirect(path);

  return {
    ...result,
    counts: { upcoming: upcoming ? result.total : (count ?? 0), history: upcoming ? (count ?? 0) : result.total }
  };
};

export const loadAdminConsultationPage = async (
  account: PortalAccount,
  requestedPage: string | string[] | undefined,
  filters: AdminFilters
): Promise<ConsultationPage> => {
  const path = adminHref(filters);
  const page = parsePage(requestedPage) ?? redirect(path);

  return listConsultations(account.supabase, account.user.id, "all", page, () => redirect(path), filters);
};

export const listConsultations = async (
  supabase: DatabaseClient,
  userId: string,
  scope: ConsultationScope,
  page: number,
  redirectToFirstPage?: () => never,
  filters?: AdminFilters
): Promise<ConsultationPage> => {
  let query = selectConsultations(supabase);
  if (scope === "mine") query = query.eq("student_id", userId);

  if (filters?.search) {
    const words = filters.search.match(/[\p{L}\p{M}\p{N}'’-]+/gu) ?? [];
    if (!words.length) query = query.is("id", null);
    for (const word of new Set(words)) {
      query = query.or(SEARCH_COLUMNS.map(column => `${column}.ilike.*${word}*`).join(","));
    }
  }

  const ascending = !filters?.descending;
  query = query.order(filters?.sort.column ?? "scheduled_at", { ascending });
  if (filters?.sort.key === "student") query = query.order("last_name", { ascending });
  const result = await readPage(query, page);
  if (result) return result;
  if (redirectToFirstPage) redirectToFirstPage();
  return listConsultations(supabase, userId, scope, 1, undefined, filters);
};
