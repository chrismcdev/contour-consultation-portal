import "server-only";
import { unstable_cache } from "next/cache";
import type { ZodType } from "zod";

import type { CatalogSource } from "@/config/catalog";

export const cacheCatalog = <T>(source: CatalogSource, name: string, load: () => Promise<T>): (() => Promise<T>) =>
  unstable_cache(load, [source.url, name], { revalidate: source.revalidateSeconds });

export const readPublicCatalog = async <T>(source: CatalogSource, schema: ZodType<T>): Promise<T> => {
  const response = await fetch(source.url, {
    cache: "no-store",
    signal: AbortSignal.timeout(8_000)
  });
  if (!response.ok) throw new Error("The public catalog is unavailable.");
  return schema.parse(await response.json());
};
