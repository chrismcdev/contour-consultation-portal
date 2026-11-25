import { Group, Progress, Text } from "@mantine/core";
import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import { adjacencyGraphs, dictionary as common } from "@zxcvbn-ts/language-common";
import { translations } from "@zxcvbn-ts/language-en";
import commonWords from "@zxcvbn-ts/language-en/src/commonWords.json";
import { useMemo, type JSX } from "react";

import type { SignUpFields } from "@/lib/auth/form";

const estimator = new ZxcvbnFactory({
  dictionary: { ...common, "commonWords-en": commonWords },
  graphs: adjacencyGraphs,
  translations,
  maxLength: 72
});

const levels = [
  { label: "Very weak", color: "red" },
  { label: "Weak", color: "orange" },
  { label: "Fair", color: "yellow" },
  { label: "Strong", color: "teal" },
  { label: "Very strong", color: "teal" }
] as const;

type StrengthProps = Pick<SignUpFields, "password" | "firstName" | "lastName" | "email">;

const PasswordStrength = ({ password, firstName, lastName, email }: StrengthProps): JSX.Element => {
  const { score, feedback } = useMemo(
    () => estimator.check(password, [firstName, lastName, email, email.split("@")[0], "Contour"].filter(Boolean)),
    [password, firstName, lastName, email]
  );
  const rating = levels[score];

  return (
    <>
      <Group gap={5} grow mt="xs" mb={4} aria-hidden="true">
        {levels.map(({ label }, index) => (
          <Progress key={label} value={index <= score ? 100 : 0} color={rating.color} size={4} />
        ))}
      </Group>
      <Text size="xs" fw={600}>
        Estimated strength: {rating.label}
      </Text>
      {feedback.suggestions.length > 0 && (
        <Text size="xs" c="dimmed">
          {feedback.warning} {feedback.suggestions[0]}
        </Text>
      )}
    </>
  );
};

export default PasswordStrength;
