import type { Metadata } from "next";
import type { JSX } from "react";
import { ColorSchemeScript, Container, Stack, mantineHtmlProps } from "@mantine/core";
import "@fontsource-variable/dm-sans";
import "@mantine/core/styles.css";
import "./portal.css";

import { COLOR_SCHEME_STORAGE_KEY } from "@/config/appearance";
import { Providers } from "./providers";

const PORTAL_TITLE = "Contour Consultation Portal";

export const metadata: Metadata = {
  title: { default: PORTAL_TITLE, template: `%s | ${PORTAL_TITLE}` },
  icons: { icon: { url: "/contour-mark.svg", type: "image/svg+xml", sizes: "any" } },
  description: "Book and manage student consultations."
};

const RootLayout = ({ children }: LayoutProps<"/">): JSX.Element => (
  <html lang="en-AU" {...mantineHtmlProps}>
    <head>
      <ColorSchemeScript defaultColorScheme="auto" localStorageKey={COLOR_SCHEME_STORAGE_KEY} />
    </head>

    <body>
      <Providers>
        <Container component="main" size="md" display="flex" mih="100dvh" py={{ base: "lg", sm: 48 }}>
          <Stack flex={1} miw={0} gap="xl">
            {children}
          </Stack>
        </Container>
      </Providers>
    </body>
  </html>
);

export default RootLayout;
