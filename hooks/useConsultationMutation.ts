"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useContext, useRef, useTransition } from "react";

import { BookingFeedbackContext } from "@/components/consultations/booking-feedback";
import { submitConsultationChange, type ConsultationMutation } from "@/lib/consultations/mutations";

type ConsultationMutationResult = {
  save: (change: ConsultationMutation) => void;
  pending: boolean;
  error: Error | null;
};

export const useConsultationMutation = (afterSave?: () => void): ConsultationMutationResult => {
  const notify = useContext(BookingFeedbackContext);
  const router = useRouter();
  const [refreshing, startRefresh] = useTransition();
  const inFlight = useRef(false);

  const { mutate, isPending, error } = useMutation({
    mutationFn: submitConsultationChange,
    retry: false,
    networkMode: "always",
    gcTime: 0,
    onSuccess: ({ status, message }, change): void => {
      notify({ message, bookedAt: change.type === "book" ? change.booking.scheduledAt : undefined });
      startRefresh(() => {
        if (status === "saved") afterSave?.();
        router.refresh();
      });
    },
    onSettled: (): void => {
      inFlight.current = false;
    }
  });

  const pending = isPending || refreshing;
  const save = (change: ConsultationMutation): void => {
    if (inFlight.current || pending) return;

    inFlight.current = true;
    notify(null);
    mutate(change);
  };

  return { save, pending, error };
};
