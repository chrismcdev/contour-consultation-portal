"use client";

import type { JSX } from "react";
import { Pagination } from "@mantine/core";
import Link from "next/link";
import styles from "./consultations.module.css";

type BookingPaginationProps = { page: number; pages: number; path: string };

export const BookingPagination = ({ page, pages, path }: BookingPaginationProps): JSX.Element | null => {
  if (pages <= 1) return null;

  const targets = { first: 1, previous: page - 1, next: page + 1, last: pages };
  const pageLink = (target: number, label: string) => {
    if (target < 1 || target > pages) return { "aria-label": label };
    const href = target === 1 ? path : `${path}${path.includes("?") ? "&" : "?"}page=${target}`;
    return { component: Link, href, "aria-label": label };
  };

  return (
    <nav aria-label="Bookings pages" className={styles.pagination}>
      <Pagination
        value={page}
        total={pages}
        siblings={0}
        size="sm"
        radius="md"
        getItemProps={target => pageLink(target, `Page ${target} of ${pages}`)}
        getControlProps={control => pageLink(targets[control], `${control} page`)}
      />
    </nav>
  );
};
