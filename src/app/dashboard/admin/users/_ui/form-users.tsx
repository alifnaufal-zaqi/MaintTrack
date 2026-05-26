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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { DropzoneUpload } from "@/components/commons/dropzone-upload";
import { createClient } from "@/lib/client";
import { UserSchema } from "@/schemas/user";
import { User, FormUser } from "@/types/users";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";
import { toast } from "sonner";
export function FormUsers() {
  const supabase = createClient();
  const router = useRouter();
  const [formError, setFormError] = useState<FormUser | null>(null);
  const { mutate, isPending: loading } = useMutation({
    mutationFn: async (
      user: Pick<
        User,
        | "fullname"
        | "email"
        | "phone_number"
        | "password"
        | "role"
        | "address"
        | "photo_profile_url"
      >,
    ) => {
      const { error } = await supabase.from("users").insert({
        ...user,
      });
      if (error) throw error;
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

    const validatedField = UserSchema.safeParse({
      fullname: formData.get("fullname"),

      email: formData.get("email"),

      phone_number: formData.get("phone_number"),

      password: formData.get("password"),

      role: formData.get("role"),

      address: formData.get("address"),
    });

    if (!validatedField.success) {
      setFormError(validatedField.error.flatten().fieldErrors);

      return;
    }

    setFormError(null);

    let photoUrl = "";

    const file = formData.get("photo") as File;

    if (file?.size > 0) {
      const { data, error } = await supabase.storage
        .from("MaintTrack-Assets")
        .upload(`users/${Date.now()}-${file.name}`, file);

      if (error) {
        toast.error(error.message);

        return;
      }

      const { data: publicData } = supabase.storage
        .from("MaintTrack-Assets")
        .getPublicUrl(data.path);

      photoUrl = publicData.publicUrl;
    }

    mutate({
      fullname: validatedField.data.fullname,

      email: validatedField.data.email,

      phone_number: validatedField.data.phone_number,

      password: validatedField.data.password,

      role: validatedField.data.role,

      address: validatedField.data.address,

      photo_profile_url: photoUrl,
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
              <Field data-invalid={Boolean(formError?.fullname)}>
                <FieldLabel>Nama</FieldLabel>

                <Input name="fullname" placeholder="Masukkan nama pengguna" />

                {formError?.fullname && (
                  <FieldError>{formError.fullname[0]}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel>Email</FieldLabel>

                <Input type="email" name="email" placeholder="Masukkan email" />
              </Field>

              <Field>
                <FieldLabel>Nomor Kontak</FieldLabel>

                <Input
                  name="phone_number"
                  placeholder="Masukkan nomor kontak"
                />
              </Field>

              <Field>
                <FieldLabel>Password</FieldLabel>

                <Input
                  type="password"
                  name="password"
                  placeholder="Masukkan password"
                />
              </Field>

              <Field>
                <FieldLabel>Role</FieldLabel>

                <Select name="role">
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>

                    <SelectItem value="operator">Operator</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Alamat</FieldLabel>

                <Textarea name="address" placeholder="Masukkan alamat" />
              </Field>

              <DropzoneUpload
                id="photo"
                name="photo"
                label="Foto Pengguna"
                pathName="users"
                error={undefined}
              />
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
