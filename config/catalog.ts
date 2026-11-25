import "server-only";

export type CatalogSource = Readonly<{ url: `https://${string}`; revalidateSeconds: number }>;

export const SCHOOL_DIRECTORY = {
  url: "https://contour-tech.github.io/contour-education-signup-form-hubspot/data/schools-v2.json",
  revalidateSeconds: 86_400
} as const satisfies CatalogSource;

export const FREE_TRIAL_FORM = {
  url: "https://forms-ap1.hsforms.com/embed/v3/form/441696810/b9c413c9-b520-4d4a-85d8-78934dc948bb/json",
  revalidateSeconds: 3_600
} as const satisfies CatalogSource;
