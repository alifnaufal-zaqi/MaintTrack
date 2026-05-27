"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup, FieldSet } from "@/components/ui/field";
import { SelectItem } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/client";
import { UserSchema } from "@/schemas/user";
import { User, FormUser } from "@/types/users";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";
import { toast } from "sonner";
import { validateFormData } from "@/utils/validate-data";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FieldInput } from "@/components/commons/field-input";
import { FieldSelect } from "@/components/commons/field-select";

export function FormUsers() {
  const supabase = createClient();
  const router = useRouter();
  const [checked, setChecked] = useState<boolean>(false);
  const [formError, setFormError] = useState<FormUser | null>(null);
  const { mutate, isPending: loading } = useMutation({
    mutationFn: async (
      user: Pick<User, "fullname" | "email" | "password" | "role">
    ) => {
      const { error: registerUserError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            fullname: user.fullname,
            role: user.role,
          },
        },
      });
      if (registerUserError) throw registerUserError;
    },
    onSuccess: () => {
      toast.success("Berhasil", {
        description: "Berhasil membuat data pengguna",
      });

      router.push("/dashboard/admin/users");
    },
    onError: (error) => {
      toast.error("Gagal", {
        description: error.message,
      });
    },
  });

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const { error: validationError, result } = validateFormData(
      formData,
      UserSchema
    );

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);

    mutate({
      fullname: result.fullname,
      email: result.email,
      password: result.password,
      role: result.role,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Form Pembuatan Pengguna</CardTitle>
        <CardDescription>Buat Pengguna anda Disini</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <FieldInput
                id="fullname"
                name="fullname"
                error={formError?.fullname?.[0]}
                label="Nama"
                type="text"
                placeholder="Masukan nama pengguna"
              />
              <FieldInput
                id="email"
                name="email"
                error={formError?.email?.[0]}
                label="Email"
                type="email"
                placeholder="Masukan email pengguna"
              />
              <FieldInput
                id="password"
                name="password"
                error={formError?.password?.[0]}
                label="Password"
                type={checked ? "text" : "password"}
                placeholder="*****"
              />
              <div className="flex gap-2 items-center">
                <Checkbox
                  onCheckedChange={(checked) => setChecked(checked === true)}
                  checked={checked}
                />
                <Label>Tampilkan Password</Label>
              </div>
              <FieldSelect
                id="role"
                name="role"
                label="Role"
                error={formError?.role?.[0]}
              >
                {["admin", "operator"].map((role, index) => (
                  <SelectItem
                    value={role}
                    key={`${role}-${index}`}
                    className="capitalize"
                  >
                    {role}
                  </SelectItem>
                ))}
              </FieldSelect>
            </FieldGroup>
          </FieldSet>
        </CardContent>

        <CardFooter className="flex gap-2 justify-end mt-4">
          <Link href="/dashboard/admin/users">
            <Button type="button" variant="outline" className="text-primary">
              Kembali
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner /> : "Simpan"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
