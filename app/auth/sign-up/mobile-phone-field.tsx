"use client";

import { Group, Input, Select } from "@mantine/core";
import { useState, type ChangeEvent, type JSX } from "react";
import { useController } from "react-hook-form";

import type { SignUpFields } from "@/lib/auth/form";
import { readMobilePhone, type PhoneCountry } from "@/utils/phone";

const countries = {
  AU: { value: "AU", label: "🇦🇺 Australia (+61)", prefix: "+61", placeholder: "0412 345 678" },
  NZ: { value: "NZ", label: "🇳🇿 New Zealand (+64)", prefix: "+64", placeholder: "021 123 4567" }
} as const;

const countryOptions = Object.values(countries);

export const MobilePhoneField = (): JSX.Element => {
  const { field, fieldState } = useController<SignUpFields, "mobilePhone">({
    name: "mobilePhone",
    defaultValue: "",
    rules: { required: "Enter a valid Australian or New Zealand phone number." }
  });
  const [{ country, text }, setInput] = useState(() => readMobilePhone(field.value, "AU"));

  const update = (input: ReturnType<typeof readMobilePhone>): void => {
    setInput(input);
    field.onChange(input.number ?? "");
  };

  const changeCountry = (next: PhoneCountry | null): void => {
    if (next) update(readMobilePhone(text, next, false));
  };

  const changePhone = (event: ChangeEvent<HTMLInputElement>): void => {
    const input = event.currentTarget;
    const next = readMobilePhone(input.value, country);
    const caret = input.selectionStart ?? input.value.length;

    if (input.value !== next.text) {
      let digitsToRight = input.value.slice(caret).replace(/\D/g, "").length;
      let position = next.text.length;
      while (position > 0 && digitsToRight > 0) {
        position--;
        if (/\d/.test(next.text[position])) digitsToRight--;
      }
      if ((event.nativeEvent as InputEvent).inputType === "deleteContentBackward") {
        while (position > 0 && /\D/.test(next.text[position - 1])) position--;
      }

      input.value = next.text;
      input.setSelectionRange(position, position);
    }
    update(next);
  };

  return (
    <Input.Wrapper
      id={field.name}
      label="Mobile phone number"
      size="md"
      required
      error={fieldState.error?.message}
      errorProps={{ role: "alert" }}
    >
      <Group wrap="nowrap" gap="xs" align="flex-start">
        <Select<PhoneCountry>
          aria-label="Country code"
          size="md"
          w={84}
          rightSectionWidth={24}
          comboboxProps={{ width: 224, position: "bottom-start" }}
          data={countryOptions}
          value={country}
          searchable={false}
          searchValue={countries[country].prefix}
          onChange={changeCountry}
        />
        <Input
          {...field}
          type="tel"
          autoComplete="tel"
          size="md"
          required
          flex={1}
          miw={0}
          value={text}
          placeholder={countries[country].placeholder}
          onChange={changePhone}
          error={fieldState.invalid}
        />
      </Group>
    </Input.Wrapper>
  );
};
