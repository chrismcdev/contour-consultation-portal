import type { Metadata } from "next";
import type { JSX } from "react";

import { AuthLayout } from "@/layouts/auth";

export const metadata = { title: "Sign in" } satisfies Metadata;

const Layout = ({ children }: LayoutProps<"/auth/login">): JSX.Element => (
  <AuthLayout
    title={metadata.title}
    link={{ href: "/auth/sign-up", label: "Create an account", prompt: "New to Contour?" }}
  >
    {children}
  </AuthLayout>
);

export default Layout;
