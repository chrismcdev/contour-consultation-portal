import { z } from "zod";

const textField = (label: string, max: number): z.ZodString => {
  const message = `Enter a ${label} between 1 and ${max} characters.`;
  return z
    .string({ error: message })
    .trim()
    .min(1, message)
    .max(max, message)
    .refine(text => !text.includes("\0"), message);
};

const scheduledAt = z
  .union([z.iso.datetime({ offset: true }), z.iso.datetime({ offset: true, precision: -1 })], {
    error: "Choose a valid date and time with a timezone."
  })
  .refine(time => Number.isFinite(Date.parse(time)), "Choose a valid date and time with a timezone.")
  .refine(time => !/\.\d{7}/.test(time), "Use at most six fractional second digits.")
  .transform(time => {
    const submillisecondDigits = time.match(/\.\d{3}(\d{1,3})/)?.[1] ?? "";
    return new Date(time).toISOString().replace("Z", `${submillisecondDigits}Z`);
  });

const selection = (label: "subject" | "campus"): z.ZodArray<z.ZodString> =>
  z
    .array(textField(label, 160))
    .min(1, `Choose at least one ${label}.`)
    .refine(values => new Set(values).size === values.length, `Choose each ${label} only once.`);

const bookingFields = z.strictObject({
  firstName: textField("first name", 80),
  lastName: textField("last name", 80),
  subjects: selection("subject"),
  campuses: selection("campus"),
  reason: textField("reason", 1000),
  scheduledAt
});

export const bookingSchema = z.preprocess(input => {
  if (!input || typeof input !== "object" || !("subject" in input) || !("campus" in input)) return input;
  if ("subjects" in input || "campuses" in input) return input;
  const { subject, campus, ...details } = input;
  return { ...details, subjects: [subject], campuses: [campus] };
}, bookingFields);

export const changeSchema = z
  .strictObject({
    scheduledAt: scheduledAt
      .refine(time => Date.parse(time) > Date.now(), "Choose a future consultation time.")
      .optional(),
    isComplete: z.boolean().optional()
  })
  .refine(body => Object.keys(body).length === 1, {
    error: "Send either a new consultation time or a completion status."
  });

export const consultationScopeSchema = z.enum(["mine", "all"], { error: "Choose mine or all." });

export type Booking = z.output<typeof bookingSchema>;
export type ConsultationChange = z.output<typeof changeSchema>;

export type Consultation = Booking & {
  id: string;
  studentId: string;
  subject: string | null;
  campus: string | null;
  isComplete: boolean;
  createdAt: string;
};

export type ConsultationScope = z.output<typeof consultationScopeSchema>;
export type ConsultationPage = {
  consultations: Consultation[];
  total: number;
  page: number;
  pageSize: number;
};
