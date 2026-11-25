import type { BaseSyntheticEvent } from "react";
import type { UseFormReturn } from "react-hook-form";

export type Credentials = { email: string; password: string };
export type SignUpFields = Credentials & {
  firstName: string;
  lastName: string;
  school: string;
  yearLevel: string;
  mobilePhone: string;
};

export type AccountSubmission<T extends Credentials> = {
  form: UseFormReturn<T>;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
};

export const authErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Unable to connect. Try again.";
