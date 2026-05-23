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
import Link from "next/link";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { DropzoneUpload } from "@/components/commons/dropzone-upload";
import { createClient } from "@/lib/client";
import { useMutation } from "@tanstack/react-query";
import { FormVendor as FormVendorType, Vendor } from "@/types/vendor";
import { SubmitEvent, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { VendorSchema } from "@/schemas/vendor";
import { Spinner } from "@/components/ui/spinner";

export function FormVendor() {
  const supabase = createClient();
  const router = useRouter();
  const [formError, setFormError] = useState<FormVendorType | null>(null);
  const { mutate, isPending: loading } = useMutation({
    mutationFn: async (newVendor: Omit<Vendor, "created_at" | "id">) => {
      const { name, email, address, phone_number, logo_url, logo_path } =
        newVendor;
      const { error } = await supabase.from("vendors").insert({
        name,
        email,
        address,
        phone_number,
        logo_url,
        logo_path,
      });

      if (error) {
        throw error;
      }
    },
    onError: (error) => {
      toast.error("Gagal", { description: error.message });
    },
    onSuccess: () => {
      toast.success("Berhasil", {
        description: "Berhasil membuat vendor baru",
      });
      router.push("/dashboard/admin/master/vendors");
    },
  });

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    const validatedField = VendorSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      address: formData.get("address"),
      phoneNumber: formData.get("contact"),
      logo: formData.get("logo"),
    });

    if (!validatedField.success) {
      setFormError(validatedField.error.flatten().fieldErrors);
      return;
    }

    setFormError(null);

    const file = formData.get("logo") as File;
    const { error, data: fileUploadData } = await supabase.storage
      .from("MaintTrack-Assets")
      .upload(`vendor/${file.name}`, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      setFormError((prev) => ({ ...prev, logo: [error.message] }));
      return;
    }

    const { data: urlFileData } = await supabase.storage
      .from("MaintTrack-Assets")
      .getPublicUrl(fileUploadData.path);

    mutate({
      name: validatedField.data.name,
      email: validatedField.data.email,
      address: validatedField.data.address,
      phone_number: validatedField.data.phoneNumber,
      logo_url: urlFileData.publicUrl,
      logo_path: fileUploadData.path,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Form Pembuatan Vendor Aset</CardTitle>
        <CardDescription>Buat Vendor Aset anda Disini</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="p-6">
          <FieldSet className="grid lg:grid-cols-3 grid-cols-1">
            <FieldGroup className="lg:col-span-2">
              <Field data-invalid={Boolean(formError?.name)}>
                <FieldLabel htmlFor="name">Nama Vendor</FieldLabel>
                <Input
                  aria-invalid={Boolean(formError?.name)}
                  type="text"
                  name="name"
                  id="name"
                  placeholder="Masukan nama vendor"
                />
                {formError?.name && (
                  <FieldError>{formError.name[0]}</FieldError>
                )}
              </Field>
              <Field data-invalid={Boolean(formError?.email)}>
                <FieldLabel htmlFor="email">Email Vendor</FieldLabel>
                <Input
                  aria-invalid={Boolean(formError?.email)}
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Masukan email vendor"
                />
                {formError?.email && (
                  <FieldError>{formError.email[0]}</FieldError>
                )}
              </Field>
              <Field data-invalid={Boolean(formError?.phoneNumber)}>
                <FieldLabel htmlFor="contact">Nomor Kontak Vendor</FieldLabel>
                <Input
                  aria-invalid={Boolean(formError?.phoneNumber)}
                  type="tel"
                  name="contact"
                  id="contact"
                  placeholder="Masukan nomor kontak vendor"
                />
                {formError?.phoneNumber && (
                  <FieldError>{formError.phoneNumber[0]}</FieldError>
                )}
              </Field>
              <Field data-invalid={Boolean(formError?.address)}>
                <FieldLabel htmlFor="address">Alamat Vendor</FieldLabel>
                <Textarea
                  aria-invalid={Boolean(formError?.address)}
                  name="address"
                  id="address"
                  placeholder="Masukan alamat vendor"
                />
                {formError?.address && (
                  <FieldError>{formError.address[0]}</FieldError>
                )}
              </Field>
            </FieldGroup>
            <FieldGroup className="h-full">
              <Field data-invalid={Boolean(formError?.logo)} className="h-full">
                <FieldLabel htmlFor="logo">Logo Vendor</FieldLabel>
                <DropzoneUpload
                  id="logo"
                  name="logo"
                  pathName="vendor"
                  error={formError?.logo?.[0]}
                />
                {formError?.logo && (
                  <FieldError>{formError.logo[0]}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t p-6">
          <Link href="/dashboard/admin/master/vendors">
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
