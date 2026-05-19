"use client";

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

import { Badge } from "@/components/ui/badge";

import { createClient } from "@/lib/client";

import { useQuery } from "@tanstack/react-query";

import { ChangeEvent } from "react";

import usePagination from "@/hooks/use-pagination";
import useSearch from "@/hooks/use-search";

import { toast } from "sonner";

const MAINTENANCE_TABLE_HEADER = [
  "Nama Asset",
  "Tanggal",
  "Vendor",
  "Status",
  "Petugas",
  "Keterangan",
];

type MaintenanceType = {
  id: string;
  asset_name: string;
  maintenance_date: string;
  vendor_name: string;
  status: string;
  technician: string;
  description: string;
};

export function Maintenance() {
  const supabase = createClient();

  const { page, limit } = usePagination();

  const { keyword, handleKeywordChange } = useSearch();

  const { data: maintenances, isLoading } = useQuery<MaintenanceType[] | null>({
    queryKey: ["maintenances", page, limit, keyword],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenances")
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
      {/* TITLE */}
      <h1 className="text-xl font-bold text-primary">Manajemen Maintenance</h1>

      {/* SEARCH */}
      <Card className="p-2">
        <Input
          type="search"
          placeholder="Cari data maintenance..."
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleKeywordChange(event.target.value)
          }
        />
      </Card>

      {/* TABLE */}
      <Card className="p-0 overflow-hidden">
        <Table className="w-full">
          {/* HEADER */}
          <TableHeader className="bg-muted">
            <TableRow>
              {MAINTENANCE_TABLE_HEADER.map((head) => (
                <TableHead key={head} className="px-6 py-4">
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          {/* BODY */}
          <TableBody>
            {maintenances?.map((maintenance) => (
              <TableRow key={maintenance.id}>
                {/* ASSET */}
                <TableCell className="px-6 py-4">
                  {maintenance.asset_name}
                </TableCell>

                {/* DATE */}
                <TableCell className="px-6 py-4">
                  {maintenance.maintenance_date}
                </TableCell>

                {/* VENDOR */}
                <TableCell className="px-6 py-4">
                  {maintenance.vendor_name}
                </TableCell>

                {/* STATUS */}
                <TableCell className="px-6 py-4">
                  <Badge
                    variant={
                      maintenance.status === "Selesai"
                        ? "default"
                        : maintenance.status === "Diproses"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {maintenance.status}
                  </Badge>
                </TableCell>

                {/* PETUGAS */}
                <TableCell className="px-6 py-4">
                  {maintenance.technician}
                </TableCell>

                {/* DESCRIPTION */}
                <TableCell className="px-6 py-4">
                  {maintenance.description}
                </TableCell>
              </TableRow>
            ))}

            {/* EMPTY */}
            {maintenances?.length === 0 && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={MAINTENANCE_TABLE_HEADER.length}
                  className="h-24 text-center"
                >
                  Data maintenance belum tersedia
                </TableCell>
              </TableRow>
            )}

            {/* LOADING */}
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={MAINTENANCE_TABLE_HEADER.length}
                  className="h-24"
                >
                  <div className="flex flex-col justify-center items-center gap-2">
                    <Spinner />

                    <span>Memuat data maintenance...</span>
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
