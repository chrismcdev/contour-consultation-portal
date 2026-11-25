"use client";

import { Alert, Button, Modal, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import type { JSX } from "react";

import { useBookingOptions } from "@/hooks/useCatalog";
import type { Booking } from "@/lib/consultations/schema";
import { BookingForm } from "./booking-form";

export const BookingDialog = ({ firstName, lastName }: Pick<Booking, "firstName" | "lastName">): JSX.Element => {
  const [opened, { open, close }] = useDisclosure();
  const { data: options, isPending, isError, refetch } = useBookingOptions(opened);

  return (
    <>
      <Button id="book" leftSection={<IconPlus size={17} aria-hidden="true" />} onClick={open}>
        Book a consultation
      </Button>
      <Modal
        opened={opened}
        onClose={close}
        title="Book a consultation"
        styles={({ headings }) => ({ title: { fontWeight: headings.fontWeight, ...headings.sizes.h3 } })}
        size="lg"
        keepMounted
        closeButtonProps={{ "aria-label": "Close booking form" }}
      >
        {options && <BookingForm options={options} firstName={firstName} lastName={lastName} onBooked={close} />}
        {isPending && <Text role="status">Loading booking options…</Text>}
        {!options && isError && (
          <Stack align="flex-start">
            <Alert color="red">Couldn’t load subjects and campuses.</Alert>
            <Button variant="default" onClick={() => refetch()}>
              Retry booking options
            </Button>
          </Stack>
        )}
      </Modal>
    </>
  );
};
