"use client";

import { localStorageColorSchemeManager, MantineProvider } from "@mantine/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type JSX, type ReactNode } from "react";

import { COLOR_SCHEME_STORAGE_KEY } from "@/config/appearance";
import { PORTAL_CSS_VARIABLES, PORTAL_THEME } from "@/config/theme";

const colorSchemeManager = localStorageColorSchemeManager({ key: COLOR_SCHEME_STORAGE_KEY });

export const Providers = ({ children }: { children: ReactNode }): JSX.Element => {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: false, networkMode: "always" } } })
  );

  return (
    <QueryClientProvider client={client}>
      <MantineProvider
        defaultColorScheme="auto"
        colorSchemeManager={colorSchemeManager}
        theme={PORTAL_THEME}
        cssVariablesResolver={PORTAL_CSS_VARIABLES}
      >
        {children}
      </MantineProvider>
    </QueryClientProvider>
  );
};
