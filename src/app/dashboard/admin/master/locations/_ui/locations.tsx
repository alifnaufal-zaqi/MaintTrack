"use client";

import { ActionButton } from "@/components/commons/action-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { locationTypeSelect } from "@/constants/location-type";
import { LOCATIONS_TABLE_HEADER } from "@/constants/locations-constant";
import usePagination from "@/hooks/use-pagination";
import useSearch from "@/hooks/use-search";
import { createClient } from "@/lib/client";
import { LocationSchema } from "@/schemas/location";
import { DialogState } from "@/types/dialog-state";
import { FormLocation, Location as LocationType } from "@/types/locations";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, SubmitEvent, useState } from "react";
import { toast } from "sonner";

export function Location() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { page, limit, handleLimitChange, handlePageChange } = usePagination();
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(
    null
  );
  const [dialogState, setDialogState] = useState<DialogState>({
    update: false,
    delete: false,
  });
  const [formError, setFormError] = useState<FormLocation | null>(null);
  const { keyword, handleKeywordChange } = useSearch();
  const { data: locations, isLoading } = useQuery<LocationType[] | null>({
    queryKey: ["locations", page, limit, keyword],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .range((page - 1) * limit, page * limit - 1)
        .order("created_at")
        .ilike("name", `%${keyword}%`);

      if (error) {
        toast.error("Gagal", {
          description: error.message,
        });
      }

      return data;
    },
  });
  const { mutate: mutationDelete, isPending: loadingDelete } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("locations").delete().eq("id", id);

      if (error) {
        throw error;
      }
    },
    onError: (error) => {
      toast.error("Gagal", { description: error.message });
    },
    onSuccess: () => {
      setDialogState((prev) => ({ ...prev, delete: false }));
      queryClient.invalidateQueries({
        queryKey: ["locations"],
      });
      toast.success("Berhasil", {
        description: "Berhasil menghapus data lokasi",
      });
    },
  });
  const { mutate: mutationUpdate, isPending: loadingUpdate } = useMutation({
    mutationFn: async (location: Omit<LocationType, "created_at">) => {
      const { error } = await supabase
        .from("locations")
        .update({
          name: location.name,
          description: location.description,
          type: location.type,
        })
        .eq("id", location.id);

      if (error) {
        throw error;
      }
    },
    onError: (error) => {
      toast.error("Gagal", { description: error.message });
    },
    onSuccess: () => {
      setDialogState((prev) => ({ ...prev, update: false }));
      queryClient.invalidateQueries({
        queryKey: ["locations"],
      });
      toast.success("Berhasil", {
        description: "Berhasil mengupdate data lokasi",
      });
    },
  });

  const handleSubmit = (
    event: SubmitEvent<HTMLFormElement>,
    location: Omit<LocationType, "created_at">
  ) => {
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
    mutationUpdate(location);
  };

  return (
    <div className="w-full space-y-4">
      <h1 className="text-xl text-primary font-bold">Manajemen Data Lokasi</h1>

      <Card className="p-2 flex flex-row gap-2 items-center">
        <Input
          type="search"
          placeholder="Cari data aset berdasarkan nama"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleKeywordChange(event.target.value)
          }
        />
        <Link href={"/dashboard/admin/master/locations/create"}>
          <Button>
            <span>
              <Plus />
            </span>
            Buat lokasi
          </Button>
        </Link>
      </Card>

      <Card className="p-0">
        <Table className="w-full rounded-lg overflow-hidden">
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              {LOCATIONS_TABLE_HEADER.map((head) => (
                <TableHead className="capitalize px-6 py-3">{head}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations?.map((location, index) => (
              <TableRow key={location.id}>
                <TableCell className="px-6 py-3">{index + 1}</TableCell>
                <TableCell className="px-6 py-3">{location.name}</TableCell>
                <TableCell className="px-6 py-3 capitalize">
                  {location.type}
                </TableCell>
                <TableCell className="px-6 py-3 max-w-xl h-fit whitespace-normal">
                  {location.description}
                </TableCell>
                <TableCell className="px-6 py-3">
                  <ActionButton
                    isDelete
                    isUpdate
                    onDeleteClick={() => {
                      setSelectedLocation(location);
                      setDialogState((prev) => ({ ...prev, delete: true }));
                    }}
                    onUpdateClick={() => {
                      setSelectedLocation(location);
                      setDialogState((prev) => ({ ...prev, update: true }));
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {locations?.length === 0 && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={LOCATIONS_TABLE_HEADER.length}
                  className="h-24 text-center"
                >
                  Data belum tersedia
                </TableCell>
              </TableRow>
            )}
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={LOCATIONS_TABLE_HEADER.length}
                  className="h-24"
                >
                  <div className="flex flex-col gap-2 justify-center items-center w-full">
                    <Spinner />
                    <span>Memuat...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog
        open={dialogState.update}
        onOpenChange={(value) =>
          setDialogState((prev) => ({ ...prev, update: value }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Form Edit Lokasi</DialogTitle>
            <DialogDescription>Edit data lokasi anda disini</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) =>
              handleSubmit(event, {
                name: selectedLocation!.name,
                type: selectedLocation!.type,
                description: selectedLocation!.description,
                id: selectedLocation!.id,
              })
            }
          >
            <FieldSet>
              <FieldGroup>
                <Field data-invalid={Boolean(formError?.name)}>
                  <FieldLabel htmlFor="name">Nama Lokasi</FieldLabel>
                  <Input
                    aria-invalid={Boolean(formError?.name)}
                    defaultValue={selectedLocation?.name}
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Masukan nama kategori aset"
                  />
                  {formError?.name && (
                    <FieldError>{formError.name[0]}</FieldError>
                  )}
                </Field>
                <Field data-invalid={Boolean(formError?.type)}>
                  <FieldLabel htmlFor="type">Tipe Lokasi</FieldLabel>
                  <Select name="type" defaultValue={selectedLocation?.type}>
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
                    defaultValue={selectedLocation?.description}
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
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant={"outline"}>
                  Tutup
                </Button>
              </DialogClose>
              <Button type="submit">Edit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogState.delete}
        onOpenChange={(value) =>
          setDialogState((prev) => ({ ...prev, delete: value }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Peringatan</DialogTitle>
            <DialogDescription>
              Apakah anda yakin ingin menghapus lokasi {selectedLocation?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={"outline"}>Tidak</Button>
            </DialogClose>
            <Button
              variant={"destructive"}
              onClick={() => mutationDelete(selectedLocation!.id)}
              disabled={loadingDelete}
            >
              {loadingDelete ? <Spinner /> : "Ya"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
