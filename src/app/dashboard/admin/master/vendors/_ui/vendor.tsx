"use client";

import { ActionButton } from "@/components/commons/action-button";
import { DropzoneUpload } from "@/components/commons/dropzone-upload";
import { PaginationButton } from "@/components/commons/pagination-button";
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
import { VENDORS_TABLE_HEADER } from "@/constants/vendors-constant";
import { useMasterData } from "@/hooks/use-mater-data";
import usePagination from "@/hooks/use-pagination";
import useSearch from "@/hooks/use-search";
import useTotalPage from "@/hooks/use-total-page";
import { createClient } from "@/lib/client";
import { VendorSchema } from "@/schemas/vendor";
import { DialogState } from "@/types/dialog-state";
import { FormVendor, Vendor } from "@/types/vendor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, SubmitEvent, useState } from "react";
import { toast } from "sonner";

export function Vendors() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { page, limit, handleLimitChange, handlePageChange } = usePagination();
  const { keyword, handleKeywordChange } = useSearch();
  const [dialogState, setDialogState] = useState<DialogState>({
    update: false,
    delete: false,
  });
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [formError, setFormError] = useState<FormVendor | null>(null);
  const { data: vendors, isLoading } = useMasterData<Vendor[]>({
    table: "vendors",
    key: ["vendors", page, limit, keyword],
    keyword,
    offset: {
      from: (page - 1) * limit,
      to: page * limit - 1,
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
      toast.error("Gagal", {
        description: error.message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vendors"],
      });
      setDialogState((prev) => ({
        ...prev,
        delete: false,
      }));
      toast.success("Berhasil", {
        description: "Berhasil menghapus vendor",
      });
    },
  });
  const { mutate: mutationUpdate, isPending: updateLoading } = useMutation({
    mutationFn: async (vendor: Omit<Vendor, "created_at">) => {
      const { id, name, email, address, phone_number, logo_path, logo_url } =
        vendor;
      const { error } = await supabase
        .from("vendors")
        .update({
          name,
          email,
          address,
          phone_number,
          logo_path,
          logo_url,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }
    },
    onError: (error) => {
      toast.error("Gagal", {
        description: error.message,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vendors"],
      });
      setDialogState((prev) => ({
        ...prev,
        update: false,
      }));
      toast.success("Berhasil", {
        description: "Berhasil mengedit data vendor",
      });
    },
  });
  const { totalPage } = useTotalPage(vendors, limit);

  const handleUpdate = async (
    event: SubmitEvent<HTMLFormElement>,
    vendor: Vendor
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
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
      toast.error("Gagal", {
        description: updateFileError.message,
      });
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
      <h1 className="text-xl text-primary font-bold">Manajemen Data Vendor</h1>
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
            <span>
              <Plus />
            </span>
            Tambah Vendor
          </Button>
        </Link>
      </Card>

      <Card className="p-0">
        <Table className="w-full rounded-lg overflow-hidden">
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              {VENDORS_TABLE_HEADER.map((head, index) => (
                <TableHead
                  key={`${head}-${index}`}
                  className="capitalize px-6 py-3"
                >
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors?.map((vendor, index) => (
              <TableRow key={vendor.id}>
                <TableCell className="px-6 py-3">{index + 1}</TableCell>
                <TableCell className="px-6 py-3">
                  <Image
                    width={0}
                    height={0}
                    alt={vendor.name}
                    src={vendor.logo_url}
                    className="
                        w-12
                        h-12
                        rounded-md
                        object-cover
                        border
                      "
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

                      setDialogState((prev) => ({
                        ...prev,
                        update: true,
                      }));
                    }}
                    onDeleteClick={() => {
                      setSelectedVendor(vendor);

                      setDialogState((prev) => ({
                        ...prev,
                        delete: true,
                      }));
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
      <PaginationButton
        currentLimit={limit}
        currentPage={page}
        onChangeLimit={handleLimitChange}
        onChangePage={handlePageChange}
        totalPages={totalPage}
      />

      {/* DELETE */}
      <Dialog
        open={dialogState.delete}
        onOpenChange={(value) =>
          setDialogState((prev) => ({
            ...prev,
            delete: value,
          }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Peringatan</DialogTitle>
            <DialogDescription>
              Apakah anda yakin ingin menghapus vendor {selectedVendor?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Batal</Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={deleteLoading}
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

      {/* Edit */}
      {selectedVendor && (
        <Dialog
          open={dialogState.update}
          onOpenChange={(value) =>
            setDialogState((prev) => ({
              ...prev,
              update: value,
            }))
          }
        >
          <DialogContent className="w-full lg:max-w-1/2">
            <DialogHeader>
              <DialogTitle>Form Edit Vendor</DialogTitle>
              <DialogDescription>
                Edit data vendor anda disini
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(event) => handleUpdate(event, selectedVendor)}>
              <FieldSet>
                <FieldGroup>
                  <Field data-invalid={Boolean(formError?.name)}>
                    <FieldLabel htmlFor="name">Nama Vendor</FieldLabel>
                    <Input
                      defaultValue={selectedVendor.name}
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
                        defaultValue={selectedVendor.email}
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
                      <FieldLabel htmlFor="contact">Nomor Kontak</FieldLabel>

                      <Input
                        defaultValue={selectedVendor.phone_number}
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
                      defaultValue={selectedVendor.address}
                      aria-invalid={Boolean(formError?.address)}
                      name="address"
                      id="address"
                      placeholder="Masukan alamat vendor"
                    />

                    {formError?.address && (
                      <FieldError>{formError.address[0]}</FieldError>
                    )}
                  </Field>

                  <DropzoneUpload
                    label="Logo Vendor"
                    id="logo"
                    name="logo"
                    pathName="vendor"
                    error={formError?.logo?.[0]}
                  />
                </FieldGroup>
              </FieldSet>

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline">Batal</Button>
                </DialogClose>

                <Button type="submit">
                  {updateLoading ? <Spinner /> : "Edit"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
