import type { ConsultationPage } from "./schema";

export type StudentView = "upcoming" | "history";
export type StudentConsultationPage = ConsultationPage & { counts: Record<StudentView, number> };

export const parseStudentView = (value: string | string[] | undefined): StudentView =>
  value === "history" ? "history" : "upcoming";

export const studentHref = (view: StudentView): string =>
  view === "history" ? "/dashboard?view=history" : "/dashboard";
