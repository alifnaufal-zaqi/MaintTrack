export type FormState<T> =
  | {
      errors?: T;
      message?: string;
    }
  | undefined;
