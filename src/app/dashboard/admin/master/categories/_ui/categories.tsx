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
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CATEGORIES_TABLE_HEADER } from "@/constants/categories-constant";
import usePagination from "@/hooks/use-pagination";
import useSearch from "@/hooks/use-search";
import { createClient } from "@/lib/client";
import { Category } from "@/types/categories";
import { DialogState } from "@/types/dialog-state";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ChangeEvent, SubmitEvent, useState } from "react";
import { toast } from "sonner";

export function AssetsCategories() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { page, limit, handleLimitChange, handlePageChange } = usePagination();
  const { keyword, handleKeywordChange } = useSearch();
  const [dialogOpen, setDialogOpen] = useState<DialogState>({
    update: false,
    delete: false,
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const { data: categories, isLoading } = useQuery<Category[] | null>({
    queryKey: ["categories", page, limit, keyword],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
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
  const { isPending: updateLoading, mutate: mutationUpdate } = useMutation({
    mutationFn: async (category: Pick<Category, "id" | "name">) => {
      const { error } = await supabase
        .from("categories")
        .update({ name: category.name })
        .eq("id", category.id);

      if (error) {
        throw error;
      }
    },
    onError: (error) => {
      toast.error("Gagal", { description: error.message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
      setDialogOpen((prev) => ({ ...prev, update: false }));
      toast.success("Berhasil", {
        description: "Berhasil memperbarui data kategori",
      });
    },
  });
  const { isPending: deleteLoading, mutate: mutationDelete } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) {
        throw error;
      }
    },
    onError: (error) => {
      toast.error("Gagal", { description: error.message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
      setDialogOpen((prev) => ({ ...prev, delete: false }));
      toast.success("Berhasil", {
        description: "Berhasil menghapus data kategori",
      });
    },
  });

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    mutationUpdate({
      id: selectedCategory!.id,
      name: formData.get("name") as string,
    });
  };

  return (
    <div className="w-full space-y-4">
      <h1 className="text-xl text-primary font-bold">
        Manajemen Data Kategori Aset
      </h1>

      <Card className="p-2 flex flex-row gap-2 items-center">
        <Input
          type="search"
          placeholder="Cari data aset berdasarkan nama"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleKeywordChange(event.target.value)
          }
        />
        <Link href={"/dashboard/admin/master/categories/create"}>
          <Button>
            <span>
              <Plus />
            </span>
            Buat kategori
          </Button>
        </Link>
      </Card>

      <Card className="p-0">
        <Table className="w-full rounded-lg overflow-hidden">
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              {CATEGORIES_TABLE_HEADER.map((head, index) => (
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
            {categories?.map((category, index) => (
              <TableRow key={category.id}>
                <TableCell className="px-6 py-3">{index + 1}</TableCell>
                <TableCell className="px-6 py-3">{category.name}</TableCell>
                <TableCell className="px-6 py-3">
                  <ActionButton
                    isDelete
                    isUpdate
                    onUpdateClick={() => {
                      setSelectedCategory(category);
                      setDialogOpen((prev) => ({ ...prev, update: true }));
                    }}
                    onDeleteClick={() => {
                      setSelectedCategory(category);
                      setDialogOpen((prev) => ({ ...prev, delete: true }));
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {categories?.length === 0 && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={CATEGORIES_TABLE_HEADER.length}
                  className="h-24 text-center"
                >
                  Data belum tersedia
                </TableCell>
              </TableRow>
            )}
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={CATEGORIES_TABLE_HEADER.length}
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
              Apakah anda yakin ingin menghapus kategori{" "}
              {selectedCategory?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={"outline"}>Batal</Button>
            </DialogClose>
            <Button
              variant={"destructive"}
              onClick={() => mutationDelete(selectedCategory!.id)}
            >
              {deleteLoading ? <Spinner /> : "Ya"}
            </Button>
          </DialogFooter>
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
              <DialogTitle>Form Edit Kategori</DialogTitle>
              <DialogDescription>
                Edit Kategori Aset anda Disini
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(event) => handleSubmit(event)}>
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="name">Nama Kategori</FieldLabel>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Masukan nama kategori aset"
                      defaultValue={selectedCategory.name}
                    />
                  </Field>
                </FieldGroup>
              </FieldSet>
              <DialogFooter className="mt-4">
                <DialogClose>
                  <Button variant={"outline"}>Batal</Button>
                </DialogClose>
                <Button>{updateLoading ? <Spinner /> : "Edit"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
