"use client";

import type { JSX } from "react";
import { Button, Text } from "@mantine/core";

import { AuthLayout } from "@/layouts/auth";

const AppError = ({ retry }: { retry: () => void }): JSX.Element => (
  <AuthLayout title="Page unavailable">
    <Text>We couldn’t load this page. Please try again.</Text>
    <Button onClick={retry}>Try again</Button>
  </AuthLayout>
);

export default AppError;
