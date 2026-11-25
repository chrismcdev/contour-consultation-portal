"use client";

import { ActionIcon, Menu, useMantineColorScheme } from "@mantine/core";
import { IconSunMoon } from "@tabler/icons-react";
import type { JSX } from "react";

const SCHEMES = [
  ["auto", "System"],
  ["light", "Light"],
  ["dark", "Dark"]
] as const;

export const AppearanceMenu = (): JSX.Element => {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <Menu position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="default" size="lg" aria-label="Appearance" title="Appearance">
          <IconSunMoon size={18} aria-hidden="true" />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Appearance</Menu.Label>
        {SCHEMES.map(([value, label]) => (
          <Menu.RadioItem
            key={value}
            value={value}
            checked={colorScheme === value}
            onChange={() => setColorScheme(value)}
            closeMenuOnClick
          >
            {label}
          </Menu.RadioItem>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};
