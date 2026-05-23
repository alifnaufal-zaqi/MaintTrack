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

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";

import { createClient } from "@/lib/client";

import { useQuery } from "@tanstack/react-query";

import { ChangeEvent, useState } from "react";

import Link from "next/link";

import usePagination from "@/hooks/use-pagination";
import useSearch from "@/hooks/use-search";

import { Plus, MoreVertical } from "lucide-react";

import { toast } from "sonner";

const VENDORS_TABLE_HEADER = [
  "Logo",
  "Nama Vendor",
  "Email",
  "Kontak",
  "Alamat",
  "Aksi",
];

type Vendor = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  logo_url: string;
};

export function Vendors() {
  const supabase = createClient();

  const { page, limit } = usePagination();

  const { keyword, handleKeywordChange } = useSearch();

  const [dialogOpen, setDialogOpen] = useState({
    update: false,
    delete: false,
  });

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

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

  return (
    <div className="w-full space-y-4">
      {/* TITLE */}
      <h1 className="text-xl font-bold text-primary">Manajemen Vendor</h1>

      {/* SEARCH */}
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

      {/* TABLE */}
      <Card className="p-0 overflow-hidden">
        <Table className="w-full">
          {/* HEADER */}
          <TableHeader className="bg-muted">
            <TableRow>
              {VENDORS_TABLE_HEADER.map((head) => (
                <TableHead key={head} className="px-6 py-4">
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          {/* BODY */}
          <TableBody>
            {vendors?.map((vendor) => (
              <TableRow key={vendor.id}>
                {/* LOGO */}
                <TableCell className="px-6 py-4">
                  <img
                    src={vendor.logo_url}
                    alt={vendor.name}
                    className="
                      w-12
                      h-12
                      rounded-md
                      object-cover
                      border
                    "
                  />
                </TableCell>

                {/* NAME */}
                <TableCell className="px-6 py-4">{vendor.name}</TableCell>

                {/* EMAIL */}
                <TableCell className="px-6 py-4">{vendor.email}</TableCell>

                {/* PHONE */}
                <TableCell className="px-6 py-4">
                  {vendor.phone_number}
                </TableCell>

                {/* ADDRESS */}
                <TableCell className="px-6 py-4">{vendor.address}</TableCell>

                {/* ACTION */}
                <TableCell className="px-6 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      {/* EDIT */}
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedVendor(vendor);

                          setDialogOpen((prev) => ({
                            ...prev,
                            update: true,
                          }));
                        }}
                      >
                        Edit
                      </DropdownMenuItem>

                      {/* DELETE */}
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => {
                          setSelectedVendor(vendor);

                          setDialogOpen((prev) => ({
                            ...prev,
                            delete: true,
                          }));
                        }}
                      >
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}

            {/* EMPTY */}
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

            {/* LOADING */}
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={VENDORS_TABLE_HEADER.length}
                  className="h-24"
                >
                  <div className="flex flex-col justify-center items-center gap-2">
                    <Spinner />

                    <span>Memuat data vendor...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* DIALOG DELETE */}
      <Dialog
        open={dialogOpen.delete}
        onOpenChange={(value) =>
          setDialogOpen((prev) => ({
            ...prev,
            delete: value,
          }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Vendor</DialogTitle>

            <DialogDescription>
              Apakah anda yakin ingin menghapus vendor ini?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Batal</Button>
            </DialogClose>

            <Button variant="destructive">Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG EDIT */}
      {selectedVendor && (
        <Dialog
          open={dialogOpen.update}
          onOpenChange={(value) =>
            setDialogOpen((prev) => ({
              ...prev,
              update: value,
            }))
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Vendor</DialogTitle>

              <DialogDescription>Edit data vendor disini</DialogDescription>
            </DialogHeader>

            <form>
              <FieldSet>
                <FieldGroup>
                  {/* NAMA */}
                  <Field>
                    <FieldLabel>Nama Vendor</FieldLabel>

                    <Input defaultValue={selectedVendor.name} />
                  </Field>

                  {/* EMAIL */}
                  <Field>
                    <FieldLabel>Email</FieldLabel>

                    <Input defaultValue={selectedVendor.email} />
                  </Field>

                  {/* PHONE */}
                  <Field>
                    <FieldLabel>Nomor Kontak</FieldLabel>

                    <Input defaultValue={selectedVendor.phone_number} />
                  </Field>

                  {/* ADDRESS */}
                  <Field>
                    <FieldLabel>Alamat</FieldLabel>

                    <Input defaultValue={selectedVendor.address} />
                  </Field>

                  {/* LOGO */}
                  <Field>
                    <FieldLabel>Logo Vendor</FieldLabel>

                    <Input type="file" />
                  </Field>
                </FieldGroup>
              </FieldSet>

              <DialogFooter className="mt-4">
                <DialogClose>
                  <Button variant="outline">Batal</Button>
                </DialogClose>

                <Button>Simpan</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
