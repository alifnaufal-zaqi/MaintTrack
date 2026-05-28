"use client";

import { Badge } from "@/components/ui/badge";
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
import { MAINTENANCE_TABLE_HEADER } from "@/constants/maintenance-constant";
import usePagination from "@/hooks/use-pagination";
import useSearch from "@/hooks/use-search";
import { createClient } from "@/lib/client";
import { Maintenance as MaintenanceType } from "@/types/maintenance";
import { useQuery } from "@tanstack/react-query";
import { ChangeEvent } from "react";
import { toast } from "sonner";

export function Maintenance() {
  const supabase = createClient();
  const { page, limit } = usePagination();
  const { keyword, handleKeywordChange } = useSearch();
  const { data: maintenances, isLoading } = useQuery<MaintenanceType[] | null>({
    queryKey: ["maintenances", page, limit, keyword],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_logs")
        .select("*")
        .range((page - 1) * limit, page * limit - 1)
        .order("created_at")
        .ilike("asset_name", `%${keyword}%`);

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
        Manajemen Data Maintenance
      </h1>

      <Card className="p-2 flex flex-row gap-2 items-center">
        <Input
          type="search"
          placeholder="Cari data maintenance berdasarkan nama aset"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleKeywordChange(event.target.value)
          }
        />
      </Card>

      <Card className="p-0">
        <Table className="w-full rounded-lg overflow-hidden">
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              {MAINTENANCE_TABLE_HEADER.map((head) => (
                <TableHead className="capitalize px-6 py-3" key={head}>
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {maintenances?.map((maintenance, index) => (
              <TableRow key={maintenance.id}>
                <TableCell className="px-6 py-3">{index + 1}</TableCell>
                <TableCell className="px-6 py-3">
                  {maintenance.asset_name}
                </TableCell>
                <TableCell className="px-6 py-3">
                  {maintenance.maintenance_date}
                </TableCell>
                <TableCell className="px-6 py-3">
                  {maintenance.maintenance_type}
                </TableCell>
                <TableCell className="px-6 py-3">{maintenance.pic}</TableCell>
                <TableCell className="px-6 py-3">
                  <Badge
                    variant={
                      maintenance.progress_status === "Selesai"
                        ? "default"
                        : maintenance.progress_status === "Proses"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {maintenance.progress_status}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-3">
                  {maintenance.description}
                </TableCell>
              </TableRow>
            ))}
            {maintenances?.length === 0 && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={MAINTENANCE_TABLE_HEADER.length}
                  className="h-24 text-center"
                >
                  Data belum tersedia
                </TableCell>
              </TableRow>
            )}
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={MAINTENANCE_TABLE_HEADER.length}
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
