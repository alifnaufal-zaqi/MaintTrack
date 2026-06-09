"use client";

import { PaginationButton } from "@/components/commons/pagination-button";
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
import { MOVEMENTS_TABLE_HEADER } from "@/constants/movements-constant";
import usePagination from "@/hooks/use-pagination";
import useSearch from "@/hooks/use-search";
import useTotalPage from "@/hooks/use-total-page";
import { createClient } from "@/lib/client";
import { Movement as MovementType } from "@/types/movements";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { toast } from "sonner";

export function Movements() {
  const supabase = createClient();
  const { handleKeywordChange, keyword } = useSearch();
  const { limit, page, handleLimitChange, handlePageChange } = usePagination();
  const { data: movements, isLoading } = useQuery<{
    data: Omit<MovementType, "notes" | "created_at">[] | null;
    count: number | null;
  }>({
    queryKey: ["item_movements", keyword, page, limit],
    queryFn: async () => {
      const { data, error, count } = await supabase
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
            pic:user_profiles!inner (
                fullname
            )
        `,
          { count: "exact" }
        )
        .range((page - 1) * limit, page * limit - 1)
        .order("created_at")
        .ilike("asset.name", `%${keyword}%`);

      if (error) {
        toast.error("Gagal", { description: error.message });
      }

      return {
        data: data as Omit<MovementType, "notes" | "created_at">[] | null,
        count,
      };
    },
  });
  const { totalPage } = useTotalPage(movements, limit);

  return (
    <div className="w-full space-y-4">
      <h1 className="text-xl font-bold text-primary">Perpindahan Aset</h1>

      <Card className="p-2 flex flex-row gap-2 items-center">
        <Input
          type="search"
          placeholder="Cari data perpindahan"
          onChange={(event) => handleKeywordChange(event.target.value)}
        />
      </Card>

      <Card className="p-0">
        <Table className="w-full rounded-lg overflow-hidden">
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              {MOVEMENTS_TABLE_HEADER.map((header, index) => (
                <TableHead
                  key={`${header}-${index}`}
                  className="capitalize px-6 py-3"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements?.data?.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell className="px-6 py-3">
                  <Image
                    alt={movement.asset.name}
                    src={movement.asset.asset_image_url}
                    width={0}
                    height={0}
                    className="w-12 h-12 rounded-md border"
                  />
                </TableCell>
                <TableCell className="px-6 py-3">
                  {movement.asset.name}
                </TableCell>
                <TableCell className="px-6 py-3">
                  {movement.from_location.name}
                </TableCell>
                <TableCell className="px-6 py-3">
                  {movement.to_location.name}
                </TableCell>
                <TableCell className="px-6 py-3">
                  {movement.movement_date}
                </TableCell>
                <TableCell className="px-6 py-3">
                  {movement.pic.fullname}
                </TableCell>
              </TableRow>
            ))}
            {movements?.data?.length === 0 && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={MOVEMENTS_TABLE_HEADER.length}
                  className="h-24 text-center"
                >
                  Data belum tersedia
                </TableCell>
              </TableRow>
            )}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={MOVEMENTS_TABLE_HEADER.length}>
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
    </div>
  );
}
