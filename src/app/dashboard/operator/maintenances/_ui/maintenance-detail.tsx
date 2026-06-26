"use client";

import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/client";
import { Maintenance } from "@/types/maintenance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, SubmitEvent } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { FieldInput } from "@/components/commons/field-input";
import { FieldSelect } from "@/components/commons/field-select";
import { SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { validateFormData } from "@/utils/validate-data";
import {
  CompleteMaintenanceSchema,
  MaintenanceSchema,
  UpdateMaintenanceSchema,
} from "@/schemas/maintenance";
import { MAINTENANCE_TYPE } from "@/constants/maintenance-constant";
import { useMasterData } from "@/hooks/use-mater-data";

export function MaintenanceDetail({ id }: { id: string }) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [isCompleteDialogOpen, setIsCompleteDialogOpen] =
    useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);

  const [formError, setFormError] = useState<{
    cost?: string[] | undefined;
  } | null>(null);

  const [editFormError, setEditFormError] = useState<{
    date?: string[] | undefined;
    type?: string[] | undefined;
    notes?: string[] | undefined;
    cost?: string[] | undefined;
  } | null>(null);

  const { data: maintenance, isLoading } = useQuery<{
    data: Maintenance | null;
  }>({
    queryKey: ["maintenances", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenances")
        .select(
          `
            id,
            asset:assets!inner (
                id,
                name,
                asset_image_url
            ),
            maintenance_date,
            maintenance_type,
            cost,
            notes,
            created_by:user_profiles!inner (
              fullname
            ),
            progress_status,
            created_at
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      return { data: data as unknown as Maintenance | null };
    },
  });
  const { data: asset } = useMasterData<{ maintenance_interval: number }>({
    key: ["assets"],
    table: "assets",
    select: "maintenance_interval",
    where: {
      col: "id",
      value: maintenance?.data?.asset.id || "",
    },
  });

  const { mutate, isPending: loading } = useMutation({
    mutationFn: async ({ status, cost }: { status: string; cost?: number }) => {
      const { error: updateStatusError } = await supabase
        .from("maintenances")
        .update({
          progress_status: status,
          ...(cost !== undefined && { cost }),
        })
        .eq("id", id);

      if (updateStatusError) throw updateStatusError;

      if (status === "complete") {
        const today = new Date().toLocaleDateString("en-CA");
        const isRoutine =
          maintenance?.data?.maintenance_type.toLowerCase() === "rutin";

        let updateData: any = {
          last_maintenance_date: today,
        };

        if (isRoutine && asset?.data?.maintenance_interval) {
          const nextDate = new Date();
          nextDate.setMonth(
            nextDate.getMonth() + asset.data.maintenance_interval
          );
          updateData.next_maintenance_date =
            nextDate.toLocaleDateString("en-CA");
        }

        const { error: updateDateAssetError } = await supabase
          .from("assets")
          .update(updateData)
          .eq("id", maintenance?.data?.asset.id);

        if (updateDateAssetError) throw updateDateAssetError;
      }
    },
    onError: (error) => toast.error("Gagal", { description: error.message }),
    onSuccess: () => {
      setIsCompleteDialogOpen(false);
      toast.success("Berhasil", {
        description: "Status maintenance berhasil diubah",
      });
      queryClient.invalidateQueries({ queryKey: ["maintenances", id] });
    },
  });

  const { mutate: mutateUpdate, isPending: updating } = useMutation({
    mutationFn: async (payload: {
      maintenance_date: string;
      maintenance_type: string;
      notes: string | null;
    }) => {
      const { error } = await supabase
        .from("maintenances")
        .update(payload)
        .eq("id", id);

      if (error) throw error;
    },
    onError: (error) => toast.error("Gagal", { description: error.message }),
    onSuccess: () => {
      setIsEditDialogOpen(false);
      toast.success("Berhasil", {
        description: "Data maintenance berhasil diperbarui",
      });
      queryClient.invalidateQueries({ queryKey: ["maintenances", id] });
    },
  });

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { error, result } = validateFormData(
      formData,
      CompleteMaintenanceSchema
    );

    if (error) {
      setFormError(error);
      return;
    }

    setFormError(null);
    mutate({
      status: "complete",
      cost: parseInt(result.cost),
    });
  };

  const handleEditSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { error, result } = validateFormData(formData, MaintenanceSchema);

    if (error) {
      setEditFormError(error);
      return;
    }

    setEditFormError(null);
    mutateUpdate({
      maintenance_date: result.date,
      maintenance_type: result.type,
      notes: result.notes || null,
    });
  };

  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const data = maintenance?.data;

  if (!data) {
    return (
      <div className="w-full space-y-4">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/operator/maintenances">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Link>
        </Button>
        <div className="w-full h-48 flex items-center justify-center">
          <p>Data tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-primary">Detail Maintenance</h1>
        <div className="flex gap-2 items-center">
          {data.progress_status !== "complete" && (
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(true)}
              disabled={updating}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Data
            </Button>
          )}
          {data.progress_status === "pending" && (
            <Button
              onClick={() => mutate({ status: "process" })}
              disabled={loading}
              variant="secondary"
            >
              Mulai Proses
            </Button>
          )}
          {data.progress_status === "process" && (
            <Button
              onClick={() => setIsCompleteDialogOpen(true)}
              disabled={loading}
            >
              Selesai
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/dashboard/operator/maintenances">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex flex-col items-center justify-center space-y-4 md:col-span-1">
          <Image
            src={data.asset.asset_image_url}
            alt={data.asset.name}
            width={200}
            height={200}
            className="rounded-lg object-cover w-full aspect-square"
          />
          <h2 className="text-lg font-semibold text-center">
            {data.asset.name}
          </h2>
          <Badge
            className="capitalize"
            variant={
              data.progress_status === "complete"
                ? "default"
                : data.progress_status === "process"
                ? "secondary"
                : "outline"
            }
          >
            {data.progress_status}
          </Badge>
        </Card>

        <Card className="p-6 space-y-6 md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tipe Maintenance</p>
              <p className="font-medium capitalize">{data.maintenance_type}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Tanggal Maintenance
              </p>
              <p className="font-medium">{data.maintenance_date}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">PIC / Dibuat Oleh</p>
              <p className="font-medium">{data.created_by.fullname}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Biaya (Cost)</p>
              <p className="font-medium">
                {data.cost ? `Rp ${data.cost.toLocaleString("id-ID")}` : "-"}
              </p>
            </div>
          </div>
          <div className="space-y-1 border-t pt-4">
            <p className="text-sm text-muted-foreground">Catatan</p>
            <p className="font-medium whitespace-pre-wrap">
              {data.notes || "-"}
            </p>
          </div>
        </Card>
      </div>

      <Dialog
        open={isCompleteDialogOpen}
        onOpenChange={(value) => setIsCompleteDialogOpen(value)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Menyelesaikan Maintenance</DialogTitle>
            <DialogDescription>
              Untuk Menyelesaikan Maintenance Anda harus Mengisi Form dibawah
              Ini Terlebih Dahulu
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <FieldSet>
              <FieldGroup>
                <FieldInput
                  error={formError?.cost?.[0]}
                  id="cost"
                  label="Biaya Maintenance"
                  type="number"
                  name="cost"
                  placeholder="Masukan biaya maintenance"
                  defaultValue={data.cost || ""}
                />
              </FieldGroup>
            </FieldSet>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Tutup
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? <Spinner /> : "Selesaikan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(value) => setIsEditDialogOpen(value)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Data Maintenance</DialogTitle>
            <DialogDescription>
              Perbarui data maintenance aset ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <FieldSet>
              <FieldGroup>
                <FieldInput
                  error={editFormError?.date?.[0]}
                  id="date"
                  label="Tanggal Maintenance"
                  type="date"
                  name="date"
                  defaultValue={data.maintenance_date}
                />
                <FieldSelect
                  error={editFormError?.type?.[0]}
                  id="type"
                  label="Jenis Maintenance"
                  name="type"
                  defaultValue={data.maintenance_type}
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
                <Field data-invalid={Boolean(editFormError?.notes?.[0])}>
                  <FieldLabel htmlFor="notes">Catatan</FieldLabel>
                  <Textarea
                    aria-invalid={Boolean(editFormError?.notes?.[0])}
                    name="notes"
                    id="notes"
                    placeholder="Masukan catatan maintenance"
                    className="h-32 resize-none"
                    defaultValue={data.notes || ""}
                  />
                  {editFormError?.notes?.[0] && (
                    <FieldError>{editFormError?.notes?.[0]}</FieldError>
                  )}
                </Field>
              </FieldGroup>
            </FieldSet>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Batal
                </Button>
              </DialogClose>
              <Button type="submit" disabled={updating}>
                {updating ? <Spinner /> : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
