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

import { Input } from "@/components/ui/input";

import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";

import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { DropzoneUpload } from "@/components/commons/dropzone-upload";

import { Spinner } from "@/components/ui/spinner";

import Link from "next/link";

import { createClient } from "@/lib/client";

import { useMutation } from "@tanstack/react-query";

import { SubmitEvent } from "react";

import { toast } from "sonner";

import { useRouter } from "next/navigation";

type UserData = {
  fullname: string;
  email: string;
  phone_number: string;
  password: string;
  role: string;
  address: string;
  photo_profile_url?: string;
};

export function FormUsers() {
  const supabase = createClient();

  const router = useRouter();

  const { mutate, isPending: loading } = useMutation({
    mutationFn: async (newUser: UserData) => {
      const { error } = await supabase.from("users").insert(newUser);

      if (error) throw error;
    },

    onSuccess: () => {
      toast.success("Berhasil membuat pengguna");

      router.push("/dashboard/admin/users");
    },

    onError: (error: any) => {
      toast.error("Gagal", {
        description: error.message,
      });
    },
  });

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const fullname = formData.get("fullname") as string;

    const email = formData.get("email") as string;

    const phoneNumber = formData.get("contact") as string;

    const password = formData.get("password") as string;

    const role = formData.get("role") as string;

    const address = formData.get("address") as string;

    const file = formData.get("photo") as File;

    let photoUrl = "";

    if (file?.size > 0) {
      const { data: uploadData, error } = await supabase.storage
        .from("MaintTrack-Assets")
        .upload(`users/${Date.now()}-${file.name}`, file);

      if (error) {
        toast.error(error.message);
        return;
      }

      const { data: publicData } = supabase.storage
        .from("MaintTrack-Assets")
        .getPublicUrl(uploadData.path);

      photoUrl = publicData.publicUrl;
    }

    mutate({
      fullname,
      email,
      phone_number: phoneNumber,
      password,
      role,
      address,
      photo_profile_url: photoUrl,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Form Pembuatan Pengguna</CardTitle>

        <CardDescription>Tambahkan Pengguna Aset anda Disini</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="p-6">
          <FieldSet className="grid lg:grid-cols-3 grid-cols-1">
            <FieldGroup className="lg:col-span-2">
              <Field>
                <FieldLabel>Nama Pengguna</FieldLabel>

                <Input name="fullname" placeholder="Masukkan nama pengguna" />
              </Field>

              <Field>
                <FieldLabel>Email</FieldLabel>

                <Input type="email" name="email" placeholder="Masukkan email" />
              </Field>

              <Field>
                <FieldLabel>Nomor Kontak</FieldLabel>

                <Input
                  name="contact"
                  placeholder="Masukkan nomor kontak pengguna"
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
                    <SelectValue placeholder="Pilih role pengguna" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>

                    <SelectItem value="operator">Operator</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Alamat</FieldLabel>

                <Textarea
                  name="address"
                  placeholder="Masukkan alamat pengguna"
                />
              </Field>
            </FieldGroup>

            <FieldGroup className="h-full">
              <Field className="h-full">
                <FieldLabel>Foto Pengguna</FieldLabel>

                <DropzoneUpload id="photo" name="photo" />
              </Field>
            </FieldGroup>
          </FieldSet>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 border-t p-6">
          <Link href="/dashboard/admin/users">
            <Button type="button" variant="outline">
              Batal
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
