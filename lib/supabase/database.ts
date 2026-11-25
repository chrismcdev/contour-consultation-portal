import type { SupabaseClient } from "@supabase/supabase-js";

export type DatabaseClient = SupabaseClient<Database>;

export const CONSULTATION_COLUMNS = `
  id, studentId:student_id, firstName:first_name, lastName:last_name, subjects, campuses, subject, campus, reason,
  scheduledAt:scheduled_at, isComplete:is_complete, createdAt:created_at
`;

type BookingColumns = {
  first_name: string;
  last_name: string;
  reason: string;
  scheduled_at: string;
};

type ConsultationRow = BookingColumns & {
  subjects: string[];
  campuses: string[];
  subject: string | null;
  campus: string | null;
  id: string;
  student_id: string;
  created_at: string;
  is_complete: boolean;
};

type BookingInsert = BookingColumns & Partial<Pick<ConsultationRow, "subjects" | "campuses" | "subject" | "campus">>;

export type Database = {
  public: {
    Tables: {
      consultations: {
        Row: ConsultationRow;
        Insert: BookingInsert;
        Update: Partial<Pick<ConsultationRow, "scheduled_at" | "is_complete">>;
        Relationships: [];
      };
      admin_users: {
        Row: { user_id: string };
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      book_consultation_once: {
        Args: {
          request_id: string;
          details: BookingColumns & Pick<ConsultationRow, "subjects" | "campuses">;
          allow_create: boolean;
        };
        Returns: ConsultationRow[];
        SetofOptions: { from: "*"; to: "consultations"; isOneToOne: false; isSetofReturn: true };
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
