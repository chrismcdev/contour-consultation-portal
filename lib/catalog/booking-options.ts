import "server-only";
import union from "lodash/union";
import { z } from "zod";

import { FREE_TRIAL_FORM } from "@/config/catalog";
import type { BookingOptions } from "./contracts";
import { cacheCatalog, readPublicCatalog } from "./source";

const option = z.object({ label: z.string(), value: z.string(), hidden: z.boolean().optional() });
const optionsSchema = z.array(option);
const field = z.object({ name: z.string(), options: z.unknown().optional() });
const definition = z.object({
  form: z.object({ formFieldGroups: z.array(z.object({ fields: z.array(field) })) })
});

type FormField = z.infer<typeof field>;
type FormOption = z.infer<typeof option>;

type TaggedOption = {
  label: string;
  tags: Partial<Record<"code" | "state" | "program" | "delivery" | "test", string>>;
};

const getFields = async (): Promise<FormField[]> => {
  const { form } = await readPublicCatalog(FREE_TRIAL_FORM, definition);
  return form.formFieldGroups.flatMap(group => group.fields);
};

const choices = (fields: FormField[], name: string): FormOption[] => {
  const field = fields.find(entry => entry.name === name);
  const options = optionsSchema.parse(field?.options ?? []).filter(item => !item.hidden);
  if (!options.length) throw new Error(`Missing catalog field: ${name}`);
  return options;
};

export const getYearLevels = cacheCatalog(FREE_TRIAL_FORM, "year-levels", async (): Promise<string[]> =>
  choices(await getFields(), "year_level").map(item => item.label)
);

const taggedOption = ({ label, value }: FormOption): TaggedOption => {
  const tags: TaggedOption["tags"] = Object.fromEntries(value.split("|").map(tag => tag.split(":")));
  return { label: label.replaceAll("&amp;", "&").trim(), tags };
};

export const getBookingOptions = cacheCatalog(FREE_TRIAL_FORM, "booking-options", async (): Promise<BookingOptions> => {
  const fields = await getFields();

  const campuses = choices(fields, "web_form__preferred_campuses")
    .map(taggedOption)
    .filter(({ tags }) => tags.code && tags.test !== "true");
  const online = campuses.filter(campus => campus.tags.code === "ONLINE").map(campus => campus.label);
  const campusesByState = Map.groupBy(campuses, campus => campus.tags.state);

  const subjects = choices(fields, "web_form__interested_subject").map(taggedOption);
  const options = new Map<string, string[]>();

  for (const { label, tags } of subjects) {
    if (!tags.code || !tags.state || tags.test === "true") continue;
    const onlineOnly = tags.program === "MedPrep";
    if (!onlineOnly && tags.delivery !== "Term") continue;

    const local = onlineOnly ? [] : campusesByState.get(tags.state)?.map(campus => campus.label);
    const eligible = union(options.get(label), online, local);
    if (eligible.length) options.set(label, eligible);
  }

  if (!options.size) throw new Error("No consultation options were returned.");
  return Object.fromEntries(Array.from(options, ([subject, locations]) => [subject, locations.sort()]));
});
