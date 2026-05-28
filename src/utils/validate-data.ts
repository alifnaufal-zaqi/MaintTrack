import * as z from "zod";

export function validateFormData<T>(
  formData: FormData,
  schema: z.ZodSchema<T>
) {
  const data = Object.fromEntries(formData.entries()) as T;
  const validatedField = schema.safeParse({ ...data });

  if (!validatedField.success) {
    return {
      result: null,
      error: validatedField.error.flatten().fieldErrors,
    };
  }

  return {
    result: validatedField.data,
    error: null,
  };
}
