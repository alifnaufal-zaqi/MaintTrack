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
import { locationTypeSelect } from "@/constants/location-type";
import { createClient } from "@/lib/client";
import { LocationSchema } from "@/schemas/location";
import { FormLocation, Location } from "@/types/locations";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";
import { toast } from "sonner";

export function FormLocations() {
  const supabase = createClient();
  const router = useRouter();
  const [formError, setFormError] = useState<FormLocation | null>(null);
  const { mutate, isPending: loading } = useMutation({
    mutationFn: async (
      location: Pick<Location, "name" | "type" | "description">,
    ) => {
      const { error } = await supabase
        .from("locations")
        .insert({ ...location });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Berhasil", {
        description: "Berhasil membuat data lokasi",
      });
      router.push("/dashboard/admin/master/locations");
    },
    onError: (error) => {
      toast.error("Gagal", { description: error.message });
    },
  });

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    const validatedField = LocationSchema.safeParse({
      name: formData.get("name"),
      type: formData.get("type"),
      description: formData.get("description"),
    });

    if (!validatedField.success) {
      setFormError(validatedField.error.flatten().fieldErrors);
      return;
    }

    setFormError(null);

    mutate({
      name: validatedField.data.name,
      type: validatedField.data.type,
      description: validatedField.data.description,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Form Pembuatan Lokasi</CardTitle>
        <CardDescription>Buat Lokasi anda Disini</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Field data-invalid={Boolean(formError?.name)}>
                <FieldLabel htmlFor="name">Nama Lokasi</FieldLabel>
                <Input
                  aria-invalid={Boolean(formError?.name)}
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Masukan nama lokasi"
                />
                {formError?.name && (
                  <FieldError>{formError.name[0]}</FieldError>
                )}
              </Field>
              <Field data-invalid={Boolean(formError?.type)}>
                <FieldLabel htmlFor="type">Tipe Lokasi</FieldLabel>
                <Select name="type">
                  <SelectTrigger aria-invalid={Boolean(formError?.type)}>
                    <SelectValue id="type" placeholder="Pilih tipe ruangan" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {locationTypeSelect.map((type, index) => (
                      <SelectItem
                        key={`${type}-${index}`}
                        value={type}
                        className="capitalize"
                      >
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formError?.type && <FieldError>{formError.type}</FieldError>}
              </Field>
              <Field data-invalid={Boolean(formError?.description)}>
                <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
                <Textarea
                  aria-invalid={Boolean(formError?.description)}
                  id="description"
                  name="description"
                  placeholder="Masukan deskripsi lokasi"
                />
                {formError?.description && (
                  <FieldError>{formError.description}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className="flex gap-2 justify-end mt-4">
          <Link href={"/dashboard/admin/master/locations"}>
            <Button type="button" variant={"outline"} className="text-primary">
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
