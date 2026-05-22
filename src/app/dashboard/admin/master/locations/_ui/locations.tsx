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
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LOCATIONS_TABLE_HEADER } from "@/constants/locations-constant";
import usePagination from "@/hooks/use-pagination";
import useSearch from "@/hooks/use-search";
import { createClient } from "@/lib/client";
import { Location as LocationType } from "@/types/locations";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";

export function Location() {
  const supabase = createClient();
    const { page, limit, handleLimitChange, handlePageChange } = usePagination();
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
   const [dialogOpen, setDialogOpen] = useState<{
      update: boolean;
      delete: boolean;
    }>({ update: false, delete: false });
    const [selectedCategory, setSelectedCategory] = useState<LocationType | null>(
      null
    );

  return (
    <div className="w-full space-y-4">
      <h1 className="text-xl text-primary font-bold">
        Manajemen Data Lokasi
      </h1>

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
                <TableCell className="px-6 py-3">{location.type}</TableCell>
                <TableCell className="px-6 py-3">{location.description}</TableCell>
                <TableCell className="px-6 py-3">
                  <ActionButton 
                    isDelete 
                    isUpdate 
                    onUpdateClick={() => {
                      setSelectedCategory(location);
                      setDialogOpen((prev) => ({ ...prev, update: true }));
                    }}
                    onDeleteClick={() => {
                      setSelectedCategory(location);
                      setDialogOpen((prev) => ({ ...prev, delete: true }));
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

 {/* Dialog Delete */}
      <Dialog
        open={dialogOpen.delete}
        onOpenChange={(value) =>
          setDialogOpen((prev) => ({ ...prev, delete: value }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Peringatan</DialogTitle>
            <DialogDescription>
              Apakah anda yakin ingin menghapus lokasi ini?
            </DialogDescription>
            <DialogFooter>
              <DialogClose>
                <Button variant={"outline"}>Batal</Button>
              </DialogClose>
              <Button variant={"destructive"}>Ya</Button>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit */}
      {selectedCategory && (
        <Dialog
          open={dialogOpen.update}
          onOpenChange={(value) =>
            setDialogOpen((prev) => ({ ...prev, update: value }))
          }
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Form Edit Lokasi</DialogTitle>
              <DialogDescription>
                Edit Lokasi anda Disini
              </DialogDescription>
            </DialogHeader>
            <form action="">
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Nama Lokasi</FieldLabel>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Masukan nama lokasi"
                      defaultValue={selectedCategory.name}
                    /> 
                    </Field>                   
                    <Field>
                      <FieldLabel htmlFor="type">Tipe Lokasi</FieldLabel>
                      <Select id="type" name="type" defaultValue="">
                        <option value="" disabled>
                          Pilih tipe lokasi
                        </option>
                        <option value="ruangan">Ruangan</option>
                        <option value="kantor">Kantor</option>
                        <option value="gedung">Gedung</option>
                      </Select>
                    </Field>
                  <Field>
                  <FieldLabel htmlFor="description">Deskripsi Lokasi</FieldLabel>
                    <Input
                      type="text"
                      id="description"
                      name="description"
                      placeholder="Masukan deskripsi lokasi"
                      defaultValue={selectedCategory.description}
                    />
                  </Field>
                </FieldGroup>
              </FieldSet>
              <DialogFooter className="mt-4">
                <DialogClose>
                  <Button variant={"outline"}>Batal</Button>
                </DialogClose>
                <Button>Edit</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
