import React from "react";
import { Field, FieldError, FieldLabel } from "../ui/field";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type FieldSelectProps = {
  children: React.ReactNode;
  defaultValue?: string;
  label: string;
  error: string | undefined;
  id: string;
} & React.ComponentProps<"select">;

export function FieldSelect<T>({
  id,
  label,
  name,
  error,
  defaultValue,
  children,
}: FieldSelectProps) {
  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select defaultValue={defaultValue} name={name}>
        <SelectTrigger aria-invalid={Boolean(error)}>
          <SelectValue placeholder={`Pilih ${id}`} />
        </SelectTrigger>
        <SelectContent id={id}>{children}</SelectContent>
      </Select>
      {error && <FieldError>{error}</FieldError>}
    </Field>
  );
}
