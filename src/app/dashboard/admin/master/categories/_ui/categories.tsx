"use client";

import { ActionButton } from "@/components/commons/action-button";
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
import { CATEGORIES_TABLE_HEADER } from "@/constants/categories-constant";
import usePagination from "@/hooks/use-pagination";
import useSearch from "@/hooks/use-search";
import { createClient } from "@/lib/client";
import { Category } from "@/types/categories";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ChangeEvent } from "react";
import { toast } from "sonner";

export function AssetsCategories() {
  const supabase = createClient();
  const { page, limit, handleLimitChange, handlePageChange } = usePagination();
  const { keyword, handleKeywordChange } = useSearch();
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
              {CATEGORIES_TABLE_HEADER.map((head) => (
                <TableHead className="capitalize px-6 py-3">{head}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((category, index) => (
              <TableRow key={category.id}>
                <TableCell className="px-6 py-3">{index + 1}</TableCell>
                <TableCell className="px-6 py-3">{category.name}</TableCell>
                <TableCell className="px-6 py-3">
                  <ActionButton isDelete isUpdate />
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
    </div>
  );
}
