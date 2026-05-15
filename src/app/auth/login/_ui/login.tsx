"use client";

import { login } from "@/app/actions/login";
import { DarkModeToggle } from "@/components/commons/dark-mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useActionState } from "react";

export function Login() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <Card className="lg:w-1/4 md:w-1/2 w-full">
      <CardHeader>
        <CardTitle>Selamat Datang</CardTitle>
        <CardDescription>Silahkan masuk dengan akun anda</CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Field data-invalid={Boolean(state?.errors?.email)}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  aria-invalid={Boolean(state?.errors?.email)}
                  type="email"
                  id="email"
                  name="email"
                  placeholder="example@mail.com"
                />
                {state?.errors?.email && (
                  <FieldError>{state?.errors?.email}</FieldError>
                )}
              </Field>
              <Field data-invalid={Boolean(state?.errors?.password)}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  aria-invalid={Boolean(state?.errors?.password)}
                  type="password"
                  id="password"
                  name="password"
                  placeholder="*****"
                />
                {state?.errors?.password && (
                  <FieldError>{state?.errors?.password}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className="mt-4">
          <Button
            type="submit"
            className="w-full cursor-pointer"
            disabled={pending}
          >
            {pending ? <Spinner /> : "Masuk"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
