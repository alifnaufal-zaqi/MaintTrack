"use client";

import { FieldInput } from "@/components/commons/field-input";
import { FieldSelect } from "@/components/commons/field-select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useMasterData } from "@/hooks/use-mater-data";
import { createClient } from "@/lib/client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useQrStore } from "@/lib/stores/qr-store";
import { MovementSchema } from "@/schemas/movement";
import { Asset } from "@/types/asset";
import { Location } from "@/types/locations";
import {
  FormMovement as FormMovementType,
  MovementError,
} from "@/types/movements";
import { validateFormData } from "@/utils/validate-data";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";
import { toast } from "sonner";

export function FormMovement() {
  const router = useRouter();
  const tag = useQrStore((state) => state.tag);
  const profile = useAuthStore((state) => state.profile);
  const supabase = createClient();
  const [formError, setFormError] = useState<MovementError | null>(null);
  const { data } = useMasterData<
    Pick<
      Asset,
      "id" | "name" | "asset_image_url" | "created_at" | "current_location"
    >
  >({
    key: ["asset"],
    table: "assets",
    select:
      "id, name, asset_image_url, created_at, current_location: locations ( id, name )",
    where: { col: "qr_tag", value: tag },
  });
  const { data: locations } = useMasterData<Pick<Location, "id" | "name">[]>({
    key: ["location"],
    table: "locations",
  });
  const { mutate, isPending: loading } = useMutation({
    mutationFn: async (movement: FormMovementType) => {
      const { error: insertError } = await supabase
        .from("asset_movements")
        .insert({
          asset_id: data?.id,
          from_location_id: data?.current_location.id,
          to_location_id: movement.toLocation,
          pic: profile?.id,
        });

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from("assets")
        .update({ current_location_id: movement.toLocation })
        .eq("id", data?.id);

      if (updateError) throw updateError;
    },
    onError: (error) => toast.error("Gagal", { description: error.message }),
    onSuccess: () => {
      toast.success("Berhasil", {
        description: "Berhasil membuat data perpindahan",
      });
      router.push("/dashboard/operator/movements");
    },
  });

  if (!data || !locations) {
    return null;
  }

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { error, result } = validateFormData(formData, MovementSchema);

    if (error) {
      setFormError(error);
      return;
    }

    setFormError(null);
    mutate({
      fromLocation: data.current_location.id,
      notes: result.notes ? result.notes : null,
      pic: profile!.id,
      toLocation: result.toLocation,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Informasi Aset</CardTitle>
        <div className="flex flex-row gap-4 items-center mt-4">
          <Image
            alt={data.name}
            src={data.asset_image_url}
            width={0}
            height={0}
            className="w-16 h-16 border rounded-md"
          />

          <div className="space-y-1">
            <h2 className="text-lg text-primary font-semibold">{data.name}</h2>
            <p className="text-md font-light">ID: {data.id}</p>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <form onSubmit={handleSubmit}>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <FieldInput
                error={formError?.fromLocation?.[0]}
                value={data.current_location.name}
                name="fromLocation"
                id="fromLocation"
                label="Lokasi Asal"
                type="text"
                readOnly
              />
              <FieldSelect
                id="toLocation"
                name="toLocation"
                label="Lokasi Tujuan"
                error={formError?.toLocation?.[0]}
              >
                {locations.map((location) => (
                  <SelectItem value={location.id} key={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </FieldSelect>
              <Field data-invalid={Boolean(formError?.toLocation?.[0])}>
                <FieldLabel htmlFor="notes">Catatan</FieldLabel>
                <Textarea
                  name="notes"
                  aria-invalid={Boolean(formError?.toLocation?.[0])}
                  id="notes"
                  placeholder="Masukan catatan disini"
                  className="h-32 resize-none"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className="flex gap-2 justify-end mt-4">
          <Link href="/dashboard/operator/movements">
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
