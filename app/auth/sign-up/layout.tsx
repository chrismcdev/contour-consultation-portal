import type { Metadata } from "next";
import type { JSX } from "react";

import { AuthLayout } from "@/layouts/auth";

export const metadata = { title: "Create an account" } satisfies Metadata;

const Layout = ({ children }: LayoutProps<"/auth/sign-up">): JSX.Element => (
  <AuthLayout
    title={metadata.title}
    link={{ href: "/auth/login", label: "Back to sign in", prompt: "Already have an account?" }}
  >
    {children}
  </AuthLayout>
);

export default Layout;
