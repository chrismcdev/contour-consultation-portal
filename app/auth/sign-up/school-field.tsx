import { useState, type JSX } from "react";
import { Checkbox, Select, Stack, TextInput } from "@mantine/core";
import { useController, type Control } from "react-hook-form";
import type { UseQueryResult } from "@tanstack/react-query";

import type { SignUpFields } from "@/lib/auth/form";
import { MIN_SCHOOL_QUERY_LENGTH } from "@/lib/catalog/contracts";
import { useSchoolSearch } from "@/hooks/useCatalog";

const schoolSearchHint = (query: string, results: UseQueryResult<string[]>): string => {
  if (query.length < MIN_SCHOOL_QUERY_LENGTH) return `Type at least ${MIN_SCHOOL_QUERY_LENGTH} characters to search.`;
  if (results.isPending) return "Searching schools…";
  if (results.isError && !results.data) return "School search is unavailable.";

  return "No schools found.";
};

export const SchoolField = ({ control }: { control: Control<SignUpFields> }): JSX.Element => {
  const [unlisted, setUnlisted] = useState(false);
  const [search, setSearch] = useState("");

  const { field, fieldState } = useController({
    control,
    name: "school",
    defaultValue: "",
    rules: { validate: value => Boolean(value?.trim()) || "Choose a school or enter an unlisted school." }
  });

  const value = field.value;
  const input = {
    ...field,
    id: "school",
    value,
    maxLength: 200,
    required: true,
    error: fieldState.error?.message,
    errorProps: { role: "alert" }
  };

  const query = !unlisted && search !== value ? search.trim() : "";
  const results = useSchoolSearch(query);
  const options = !query && value ? [value] : (results.data ?? []);

  return (
    <Stack gap="xs">
      {unlisted ? (
        <TextInput {...input} label="School name" size="md" autoComplete="organization" autoFocus />
      ) : (
        <Select
          {...input}
          onChange={school => {
            field.onChange(school ?? "");
            setSearch(school ?? "");
          }}
          label="School"
          size="md"
          placeholder="Search by school name"
          data={options}
          filter={({ options }) => options}
          searchValue={search}
          onSearchChange={text => {
            setSearch(text);
            if (value && text !== value) field.onChange("");
          }}
          description={options.length ? undefined : schoolSearchHint(query, results)}
          inputWrapperOrder={["label", "input", "description", "error"]}
        />
      )}

      <Checkbox
        label="My school isn’t listed"
        checked={unlisted}
        onChange={event => {
          setUnlisted(event.currentTarget.checked);
          setSearch("");
          field.onChange("");
        }}
      />
    </Stack>
  );
};
