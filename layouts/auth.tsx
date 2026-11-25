import { ViewTransition, type JSX, type PropsWithChildren } from "react";
import Image from "next/image";
import { Divider, Flex, Group, Paper, Stack, Text, Title } from "@mantine/core";

import { AppearanceMenu } from "@/components/appearance-menu";
import { InternalLink } from "@/components/internal-link";

type AuthLayoutProps = PropsWithChildren<{ title: string; link?: { href: string; label: string; prompt?: string } }>;

export const AuthLayout = ({ children, title, link }: AuthLayoutProps): JSX.Element => (
  <ViewTransition default="none" enter="page" exit="page">
    <Flex direction={{ base: "column", sm: "row" }} align={{ sm: "center" }} my={{ sm: "auto" }} gap="xl">
      <Stack w={{ sm: "50%" }} miw={0} align="flex-start" gap="xs">
        <Group mb="sm" gap="sm">
          <InternalLink href="/" aria-label="Contour Consultation Portal home" display="inline-flex" py={5}>
            <Image src="/contour-logo.svg" alt="" width={145} height={26} unoptimized />
          </InternalLink>
          <AppearanceMenu />
        </Group>
        <Title order={1}>Manage Consultations</Title>
        {link && (
          <Text c="dimmed" size="sm">
            {link.prompt && `${link.prompt} `}
            <InternalLink href={link.href} size="sm" underline="always">
              {link.label}
            </InternalLink>
          </Text>
        )}
      </Stack>
      <Paper
        component="section"
        aria-label={title}
        w={{ sm: "50%" }}
        miw={0}
        withBorder
        radius="md"
        p={{ base: "md", sm: "xl" }}
      >
        <Stack gap="lg">
          <Stack component="header" gap="sm">
            <Title order={2}>{title}</Title>
            <Divider />
          </Stack>
          {children}
        </Stack>
      </Paper>
    </Flex>
  </ViewTransition>
);
