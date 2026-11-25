"use client";

import { useMounted } from "@mantine/hooks";

export const useBrowserTimeZone = (): string =>
  useMounted() ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
