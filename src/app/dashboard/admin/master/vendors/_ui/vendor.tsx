"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, SubmitEvent, useState } from "react";
import Link from "next/link";
import usePagination from "@/hooks/use-pagination";
import useSearch from "@/hooks/use-search";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { ActionButton } from "@/components/commons/action-button";
import Image from "next/image";
import { DialogState } from "@/types/dialog-state";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormVendor, Vendor } from "@/types/vendor";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { DropzoneUpload } from "@/components/commons/dropzone-upload";
import { VendorSchema } from "@/schemas/vendor";

const VENDORS_TABLE_HEADER = [
  "Logo",
  "Nama Vendor",
  "Email",
  "Kontak",
  "Alamat",
  "Aksi",
];

export function Vendors() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { page, limit } = usePagination();
  const { keyword, handleKeywordChange } = useSearch();
  const [dialogState, setDialogState] = useState<DialogState>({
    update: false,
    delete: false,
  });
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [formError, setFormError] = useState<FormVendor | null>(null);
  const { data: vendors, isLoading } = useQuery<Vendor[] | null>({
    queryKey: ["vendors", page, limit, keyword],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
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
  const { mutate: deleteMutation, isPending: deleteLoading } = useMutation({
    mutationFn: async ({ id, logoPath }: { id: string; logoPath: string }) => {
      const { error: deleteFileError } = await supabase.storage
        .from("MaintTrack-Assets")
        .remove([logoPath]);

      if (deleteFileError) {
        throw deleteFileError;
      }

      const { error: deleteRowError } = await supabase
        .from("vendors")
        .delete()
        .eq("id", id);

      if (deleteRowError) {
        throw deleteRowError;
      }
    },
    onError: (error) => {
      toast.error("Gagal", { description: error.message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vendors"],
      });
      setDialogState((prev) => ({ ...prev, delete: false }));
      toast.success("Berhasil", { description: "Berhasil menghapus vendor" });
    },
  });
  const { mutate: mutationUpdate, isPending: updateLoading } = useMutation({
    mutationFn: async (vendor: Omit<Vendor, "created_at">) => {
      const { name, email, address, phone_number, logo_path, logo_url, id } =
        vendor;

      const { error } = await supabase
        .from("vendors")
        .update({ name, email, address, phone_number, logo_url, logo_path })
        .eq("id", id);

      if (error) {
        throw error;
      }
    },
    onError: (error) => {
      toast.error("Gagal", { description: error.message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vendors"],
      });
      setDialogState((prev) => ({ ...prev, update: false }));
      toast.success("Berhasil", {
        description: "Berhasil mengedit data vendor",
      });
    },
  });

  const handleUpdate = async (
    event: SubmitEvent<HTMLFormElement>,
    vendor: Vendor,
  ) => {
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

    const newFile = formData.get("logo") as File;
    const { data: updateFileData, error: updateFileError } =
      await supabase.storage
        .from("MaintTrack-Assets")
        .update(vendor.logo_path, newFile);

    if (updateFileError) {
      toast.error("Error", { description: updateFileError.message });
      return;
    }

    const { data: urlFileData } = await supabase.storage
      .from("MaintTrack-Assets")
      .getPublicUrl(updateFileData.path);

    mutationUpdate({
      id: vendor.id,
      name: validatedField.data.name,
      email: validatedField.data.email,
      address: validatedField.data.address,
      phone_number: validatedField.data.phoneNumber,
      logo_path: updateFileData.path,
      logo_url: urlFileData.publicUrl,
    });
  };

  return (
    <div className="w-full space-y-4">
      <h1 className="text-xl font-bold text-primary">Manajemen Data Vendor</h1>

      <Card className="p-2 flex flex-row gap-2 items-center">
        <Input
          type="search"
          placeholder="Cari data vendor..."
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleKeywordChange(event.target.value)
          }
        />
        <Link href="/dashboard/admin/master/vendors/create">
          <Button>
            <Plus className="w-4 h-4 mr-1" />
            Tambah Vendor
          </Button>
        </Link>
      </Card>

      <Card className="p-0">
        <Table className="w-full rounded-lg overflow-hidden">
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              {VENDORS_TABLE_HEADER.map((head) => (
                <TableHead key={head} className="px-6 py-3">
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors?.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="px-6 py-3">
                  <Image
                    width={0}
                    height={0}
                    alt={vendor.name}
                    src={vendor.logo_url}
                    className="w-12 h-12 rounded-md object-cover border"
                  />
                </TableCell>
                <TableCell className="px-6 py-3">{vendor.name}</TableCell>
                <TableCell className="px-6 py-3">{vendor.email}</TableCell>
                <TableCell className="px-6 py-3">
                  {vendor.phone_number}
                </TableCell>
                <TableCell className="px-6 py-3">{vendor.address}</TableCell>
                <TableCell className="px-6 py-3">
                  <ActionButton
                    isDelete
                    isUpdate
                    onUpdateClick={() => {
                      setSelectedVendor(vendor);
                      setDialogState((prev) => ({ ...prev, update: true }));
                    }}
                    onDeleteClick={() => {
                      setSelectedVendor(vendor);
                      setDialogState((prev) => ({ ...prev, delete: true }));
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {vendors?.length === 0 && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={VENDORS_TABLE_HEADER.length}
                  className="h-24 text-center"
                >
                  Data vendor belum tersedia
                </TableCell>
              </TableRow>
            )}
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={VENDORS_TABLE_HEADER.length}
                  className="h-24"
                >
                  <div className="flex flex-col justify-center items-center gap-2">
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
        open={dialogState.delete}
        onOpenChange={(value) =>
          setDialogState((prev) => ({ ...prev, delete: value }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Peringatan</DialogTitle>
            <DialogDescription>
              Apakah anda yakin ingin menghapus vendor {selectedVendor?.name} ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={"outline"}>Batal</Button>
            </DialogClose>
            <Button
              disabled={deleteLoading}
              variant={"destructive"}
              onClick={() =>
                deleteMutation({
                  id: selectedVendor!.id,
                  logoPath: selectedVendor!.logo_path,
                })
              }
            >
              {deleteLoading ? <Spinner /> : "Ya"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogState.update}
        onOpenChange={(value) =>
          setDialogState((prev) => ({ ...prev, update: value }))
        }
      >
        <DialogContent className="w-full lg:max-w-1/2">
          <DialogHeader>
            <DialogTitle>Form Edit Vendor Aset</DialogTitle>
            <DialogDescription>Edit data vendor anda disini</DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => handleUpdate(event, selectedVendor!)}>
            <FieldSet>
              <FieldGroup>
                <Field data-invalid={Boolean(formError?.name)}>
                  <FieldLabel htmlFor="name">Nama Vendor</FieldLabel>
                  <Input
                    defaultValue={selectedVendor?.name}
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
                <div className="flex gap-2">
                  <Field data-invalid={Boolean(formError?.email)}>
                    <FieldLabel htmlFor="email">Email Vendor</FieldLabel>
                    <Input
                      defaultValue={selectedVendor?.email}
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
                    <FieldLabel htmlFor="contact">
                      Nomor Kontak Vendor
                    </FieldLabel>
                    <Input
                      defaultValue={selectedVendor?.phone_number}
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
                </div>
                <Field data-invalid={Boolean(formError?.address)}>
                  <FieldLabel htmlFor="address">Alamat Vendor</FieldLabel>
                  <Textarea
                    defaultValue={selectedVendor?.address}
                    aria-invalid={Boolean(formError?.address)}
                    name="address"
                    id="address"
                    placeholder="Masukan alamat vendor"
                  />
                  {formError?.address && (
                    <FieldError>{formError.address[0]}</FieldError>
                  )}
                </Field>
                <Field data-invalid={Boolean(formError?.logo)}>
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
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant={"outline"}>Tutup</Button>
              </DialogClose>
              <Button type="submit">
                {updateLoading ? <Spinner /> : "Edit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
