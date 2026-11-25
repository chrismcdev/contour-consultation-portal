import type { JSX, PropsWithChildren } from "react";

import { DashboardLayout } from "@/layouts/dashboard";
import { hasAdminRole, requireAccount } from "@/lib/auth/account";

const PortalLayout = async ({ children }: PropsWithChildren): Promise<JSX.Element> => {
  const { firstName, lastName, supabase, user } = await requireAccount();
  const isAdmin = await hasAdminRole(supabase, user.id);

  return (
    <DashboardLayout key={user.id} userId={user.id} firstName={firstName} lastName={lastName} isAdmin={isAdmin}>
      {children}
    </DashboardLayout>
  );
};

export default PortalLayout;
