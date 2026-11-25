"use client";

import { Anchor, type AnchorProps } from "@mantine/core";
import Link from "next/link";
import type { ComponentProps, JSX } from "react";

type InternalLinkProps = AnchorProps & Omit<ComponentProps<typeof Link>, keyof AnchorProps>;

export const InternalLink = (props: InternalLinkProps): JSX.Element => <Anchor component={Link} {...props} />;
