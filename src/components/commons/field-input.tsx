import React, { InputHTMLAttributes } from "react";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

type FieldInputProps = {
  type: InputHTMLAttributes<HTMLInputElement>["type"];
  label: string;
  id: string;
  error: string | undefined;
} & React.ComponentProps<"input">;

export function FieldInput({
  type,
  id,
  label,
  error,
  ...props
}: FieldInputProps) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input aria-invalid={Boolean(error)} type={type} id={id} {...props} />
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
