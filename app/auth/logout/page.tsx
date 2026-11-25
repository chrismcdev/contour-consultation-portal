import { Text } from "@mantine/core";
import type { Metadata } from "next";
import type { JSX } from "react";

import { AuthLayout } from "@/layouts/auth";
import { LogoutButton } from "@/components/logout-button";

export const metadata = { title: "Sign out" } satisfies Metadata;

const LogoutPage = async ({ searchParams }: PageProps<"/auth/logout">): Promise<JSX.Element> => {
  const { failed } = await searchParams;

  return (
    <AuthLayout title={metadata.title} link={{ href: "/dashboard", label: "Back to dashboard" }}>
      {failed === "1" && (
        <Text role="alert" c="var(--mantine-color-error)">
          Couldn’t sign out. Please try again.
        </Text>
      )}
      <Text size="sm">Sign out of Contour on this browser?</Text>
      <LogoutButton />
    </AuthLayout>
  );
};

export default LogoutPage;
