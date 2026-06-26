"use client";

import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/client";
import { Movement } from "@/types/movements";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { validateFormData } from "@/utils/validate-data";
import { UpdateMovementSchema } from "@/schemas/movement";
import { useMasterData } from "@/hooks/use-mater-data";
import { Location } from "@/types/locations";
import { FieldSelect } from "@/components/commons/field-select";
import { SelectItem } from "@/components/ui/select";

export function MovementDetail({ id }: { id: string }) {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [editFormError, setEditFormError] = useState<{
    notes?: string[] | undefined;
    destinationLocation?: string[] | undefined;
  } | null>(null);
  const { data: locations } = useMasterData<Pick<Location, "id" | "name">[]>({
    key: ["locations"],
    table: "locations",
  });

  const { data: movement, isLoading } = useQuery<{
    data: Movement | null;
  }>({
    queryKey: ["item_movements", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("asset_movements")
        .select(
          `
            id,
            asset:assets!inner (
                name,
                asset_image_url
            ),
            from_location:locations!asset_movements_from_location_id_fkey (
                name
            ),
            to_location:locations!asset_movements_to_location_id_fkey (
                name
            ),
            movement_date,
            notes,
            created_at,
            pic:user_profiles!inner (
                fullname
            )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      return { data: data as unknown as Movement | null };
    },
  });

  const { mutate: mutateUpdate, isPending: updating } = useMutation({
    mutationFn: async (payload: {
      notes: string | null;
      to_location_id: string;
    }) => {
      const { error } = await supabase
        .from("asset_movements")
        .update(payload)
        .eq("id", id);

      if (error) throw error;
    },
    onError: (error) => toast.error("Gagal", { description: error.message }),
    onSuccess: () => {
      setIsEditDialogOpen(false);
      toast.success("Berhasil", {
        description: "Data catatan perpindahan berhasil diperbarui",
      });
      queryClient.invalidateQueries({ queryKey: ["item_movements", id] });
    },
  });

  const handleEditSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { error, result } = validateFormData(formData, UpdateMovementSchema);

    if (error) {
      setEditFormError(error);
      return;
    }

    setEditFormError(null);
    mutateUpdate({
      notes: result.notes || null,
      to_location_id: result.destinationLocation,
    });
  };

  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const data = movement?.data;

  if (!data) {
    return (
      <div className="w-full space-y-4">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/operator/movements">
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
        <h1 className="text-xl font-bold text-primary">
          Detail Perpindahan Aset
        </h1>
        <div className="flex gap-2 items-center">
          <Button
            variant="outline"
            onClick={() => setIsEditDialogOpen(true)}
            disabled={updating}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Perpindahan Aset
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/operator/movements">
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
        </Card>

        <Card className="p-6 space-y-6 md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Lokasi Awal</p>
              <p className="font-medium">{data.from_location.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Lokasi Tujuan</p>
              <p className="font-medium">{data.to_location.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tanggal Pindah</p>
              <p className="font-medium">{data.movement_date}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">PIC</p>
              <p className="font-medium">{data.pic.fullname}</p>
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
        open={isEditDialogOpen}
        onOpenChange={(value) => setIsEditDialogOpen(value)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Catatan Perpindahan</DialogTitle>
            <DialogDescription>
              Perbarui catatan untuk perpindahan aset ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <FieldSet>
              <FieldGroup>
                <FieldSelect
                  id="destinationLocation"
                  name="destinationLocation"
                  label="Lokasi Tujuan"
                  error={editFormError?.destinationLocation?.[0]}
                >
                  {locations?.data?.map((location) => (
                    <SelectItem value={location.id} key={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </FieldSelect>
                <Field data-invalid={Boolean(editFormError?.notes?.[0])}>
                  <FieldLabel htmlFor="notes">Catatan</FieldLabel>
                  <Textarea
                    aria-invalid={Boolean(editFormError?.notes?.[0])}
                    name="notes"
                    id="notes"
                    placeholder="Masukan catatan perpindahan"
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
