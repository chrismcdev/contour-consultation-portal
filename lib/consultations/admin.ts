export const ADMIN_COLUMNS = [
  { key: "date", label: "Date and time", column: "scheduled_at" },
  { key: "student", label: "Student", column: "first_name" },
  { key: "subject", label: "Subjects", column: "subject" },
  { key: "campus", label: "Preferred campuses", column: "campus" },
  { key: "status", label: "Status", column: "is_complete" }
] as const;

export const MAX_ADMIN_SEARCH_LENGTH = 100;

export type AdminFilters = {
  search: string;
  sort: (typeof ADMIN_COLUMNS)[number];
  descending: boolean;
};

export const parseAdminFilters = ({ q, sort, dir }: Record<string, string | string[] | undefined>): AdminFilters => ({
  search: typeof q === "string" ? q.trim().slice(0, MAX_ADMIN_SEARCH_LENGTH) : "",
  sort: ADMIN_COLUMNS.find(column => column.key === sort) ?? ADMIN_COLUMNS[0],
  descending: dir === "desc"
});

export const adminHref = ({ search, sort, descending }: AdminFilters): string => {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (sort.key !== "date") params.set("sort", sort.key);
  if (descending) params.set("dir", "desc");

  return params.size ? `/admin?${params}` : "/admin";
};
