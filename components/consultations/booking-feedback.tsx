"use client";

import { Affix, Notification, Transition } from "@mantine/core";
import { useFocusWithin, useHover, useMergedRef, useTimeout } from "@mantine/hooks";
import { IconCalendarCheck } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { createContext, useEffect, useRef, useState, type JSX, type PropsWithChildren } from "react";

import { InternalLink } from "@/components/internal-link";
import { useBrowserTimeZone } from "@/hooks/useBrowserTimeZone";
import { parseStudentView, studentHref } from "@/lib/consultations/student";
import { createDateTimeFormatter } from "@/utils/dateTime";
import styles from "./consultations.module.css";

type Notice = { message: string; bookedAt?: string };
export const BookingFeedbackContext = createContext<(notice: Notice | null) => void>(() => {});

export const BookingFeedback = ({ active, children }: PropsWithChildren<{ active: boolean }>): JSX.Element => {
  const view = parseStudentView(useSearchParams().get("view") ?? undefined);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [opened, setOpened] = useState(false);
  const status = useRef<HTMLDivElement>(null);
  const { hovered, ref: hoverRef } = useHover<HTMLDivElement>();
  const { focused, ref: focusRef } = useFocusWithin<HTMLDivElement>();
  const feedbackRef = useMergedRef(status, hoverRef, focusRef);
  const { start, clear } = useTimeout(() => setOpened(false), 7000);
  const timeZone = useBrowserTimeZone();

  const notify = (next: Notice | null): void => {
    if (next) setNotice(next);
    setOpened(Boolean(next));
  };

  useEffect(() => {
    if (opened && notice?.bookedAt && view === "upcoming" && !hovered && !focused) start();
    return clear;
  }, [opened, notice, view, hovered, focused, start, clear]);

  useEffect(() => {
    if (active && opened && !notice?.bookedAt && document.activeElement === document.body) status.current?.focus();
  }, [active, opened, notice, children]);

  return (
    <BookingFeedbackContext value={notify}>
      {active && (
        <Affix
          position={{ bottom: "md", right: "md" }}
          className={styles.feedback}
          role="status"
          aria-atomic="true"
          ref={feedbackRef}
          tabIndex={-1}
        >
          <Transition mounted={opened} transition="pop-bottom-right" duration={180} exitDuration={120}>
            {style => (
              <Notification
                style={style}
                role="group"
                withBorder
                inert={!opened}
                title={notice?.bookedAt && notice.message}
                icon={notice?.bookedAt && <IconCalendarCheck size={18} aria-hidden="true" />}
                closeButtonProps={{ "aria-label": "Dismiss confirmation" }}
                onClose={() => {
                  setOpened(false);
                  document.getElementById("book")?.focus();
                }}
              >
                {notice?.bookedAt ? (
                  <time dateTime={notice.bookedAt}>
                    {createDateTimeFormatter(timeZone).format(new Date(notice.bookedAt))}
                  </time>
                ) : (
                  notice?.message
                )}
                {notice?.bookedAt && view === "history" && (
                  <>
                    {" "}
                    ·{" "}
                    <InternalLink size="sm" href={studentHref("upcoming")}>
                      View upcoming
                    </InternalLink>
                  </>
                )}
              </Notification>
            )}
          </Transition>
        </Affix>
      )}
      {children}
    </BookingFeedbackContext>
  );
};
