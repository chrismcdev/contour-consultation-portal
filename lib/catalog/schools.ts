import "server-only";
import { z } from "zod";

import { SCHOOL_DIRECTORY } from "@/config/catalog";
import { MIN_SCHOOL_QUERY_LENGTH } from "./contracts";
import { cacheCatalog, readPublicCatalog } from "./source";

const directory = z.array(z.object({ name: z.string(), suburb: z.string(), state: z.string() })).nonempty();

const normalizeSearch = (value: string): string =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/\p{M}|['’]/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

const getSchoolIndex = cacheCatalog(SCHOOL_DIRECTORY, "school-index", async () => {
  const records = await readPublicCatalog(SCHOOL_DIRECTORY, directory);
  return records.map(({ name, suburb, state }) => {
    const label = `${name} (${suburb}, ${state})`;
    return { label, text: normalizeSearch(label) };
  });
});

export const searchSchools = async (query: string): Promise<string[]> => {
  const normalized = normalizeSearch(query);
  if (normalized.length < MIN_SCHOOL_QUERY_LENGTH) return [];

  const schools = await getSchoolIndex();
  const terms = normalized.split(" ");
  const matches: string[] = [];

  for (const { label, text } of schools) {
    if (terms.every(term => text.includes(term))) matches.push(label);
    if (matches.length === 20) break;
  }

  return matches;
};
