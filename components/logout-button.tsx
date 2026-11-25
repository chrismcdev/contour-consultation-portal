import type { JSX } from "react";
import { Button, type ButtonProps } from "@mantine/core";
import { IconLogout2 } from "@tabler/icons-react";

export const LogoutButton = ({ variant }: Pick<ButtonProps, "variant">): JSX.Element => (
  <form action="/api/auth/logout" method="post">
    <Button type="submit" variant={variant} fullWidth leftSection={<IconLogout2 size={16} aria-hidden="true" />}>
      Logout
    </Button>
  </form>
);
