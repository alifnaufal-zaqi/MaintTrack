"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { Textarea } from "@/components/ui/textarea";
import { SelectItem } from "@/components/ui/select";
import { useQrStore } from "@/lib/stores/qr-store";
import { Asset } from "@/types/asset";
import { useMasterData } from "@/hooks/use-mater-data";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/lib/stores/auth-store";
import { FieldInput } from "@/components/commons/field-input";
import { FieldSelect } from "@/components/commons/field-select";
import { MAINTENANCE_TYPE } from "@/constants/maintenance-constant";
import { Maintenance, MaintenanceError } from "@/types/maintenance";
import { SubmitEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createClient } from "@/lib/client";
import { validateFormData } from "@/utils/validate-data";
import { toast } from "sonner";
import { MaintenanceSchema } from "@/schemas/maintenance";
import { Spinner } from "@/components/ui/spinner";

export function FormMaintenance() {
  const supabase = createClient();
  const qrTag = useQrStore((state) => state.tag);
  const user = useAuthStore((state) => state.profile);
  const router = useRouter();
  const [formError, setFormError] = useState<MaintenanceError | null>(null);
  const { data: asset } = useMasterData<
    Pick<
      Asset,
      "id" | "name" | "asset_image_url" | "created_at" | "current_location"
    >
  >({
    key: ["asset"],
    table: "assets",
    select:
      "id, name, asset_image_url, created_at, current_location: locations ( id, name )",
    where: { col: "qr_tag", value: qrTag },
  });
  const { mutate, isPending: loading } = useMutation({
    mutationFn: async (
      maintenance: Pick<
        Maintenance,
        "maintenance_date" | "maintenance_type" | "cost" | "notes"
      >
    ) => {
      const { error } = await supabase.from("maintenances").insert({
        asset_id: asset!.data?.id,
        maintenance_date: maintenance.maintenance_date,
        maintenance_type: maintenance.maintenance_type,
        cost: maintenance.cost,
        notes: maintenance.notes || null,
        created_by: user?.id,
        progress_status: "pending",
      });

      if (error) throw error;
    },
    onError: (error) => toast.error("Gagal", { description: error.message }),
    onSuccess: () => {
      toast.success("Berhasil", {
        description: "Berhasil membuat data maintenance",
      });
      router.push("/dashboard/operator/maintenances");
    },
  });

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    const { error, result } = validateFormData(formData, MaintenanceSchema);

    if (error) {
      setFormError(error);
      return;
    }

    setFormError(null);
    mutate({
      maintenance_date: result.date,
      cost: 0,
      maintenance_type: result.type,
      notes: result.notes || null,
    });
  };

  if (!asset) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Informasi Aset</CardTitle>
        <div className="flex flex-row gap-4 items-center mt-4">
          <Image
            alt={asset?.data?.name ?? ""}
            src={asset?.data?.asset_image_url ?? ""}
            width={500}
            height={500}
            className="w-16 h-16 border rounded-md"
          />

          <div className="space-y-1">
            <h2 className="text-lg text-primary font-semibold">
              {asset?.data?.name}
            </h2>
            <p className="text-md font-light">ID: {asset?.data?.id}</p>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <form onSubmit={handleSubmit}>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <FieldInput
                error={formError?.date?.[0]}
                id="date"
                label="Tanggal Maintenance"
                type="date"
                name="date"
              />
              <FieldSelect
                error={formError?.type?.[0]}
                id="type"
                label="Jenis Maintenance"
                name="type"
              >
                {MAINTENANCE_TYPE.filter((item) => item !== "all").map(
                  (item, index) => (
                    <SelectItem
                      value={item}
                      key={`${item}-${index}`}
                      className="capitalize"
                    >
                      {item}
                    </SelectItem>
                  )
                )}
              </FieldSelect>
              <Field data-invalid={Boolean(formError?.notes?.[0])}>
                <FieldLabel htmlFor="notes">Catatan</FieldLabel>
                <Textarea
                  aria-invalid={Boolean(formError?.notes?.[0])}
                  name="notes"
                  id="notes"
                  placeholder="Masukan catata maintenance"
                  className="h-32 resize-none"
                />
                {formError?.notes?.[0] && (
                  <FieldError>{formError?.notes?.[0]}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 mt-4">
          <Link href="/dashboard/operator/maintenances">
            <Button type="button" variant="outline">
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
