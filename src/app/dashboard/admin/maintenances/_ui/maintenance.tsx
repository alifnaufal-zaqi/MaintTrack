"use client";

import { useState, ChangeEvent } from "react";

import { Card } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Spinner } from "@/components/ui/spinner";

import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import usePagination from "@/hooks/use-pagination";

import useSearch from "@/hooks/use-search";

import { createClient } from "@/lib/client";

import { useQuery } from "@tanstack/react-query";

import { Filter } from "lucide-react";

import { toast } from "sonner";

const MAINTENANCE_TABLE_HEADER = [
  "No",
  "Nama Asset",
  "Tanggal",
  "Tipe Maintenance",
  "PIC",
  "Status Progres",
  "Keterangan",
];

type MaintenanceType = {
  id: string;

  asset_name: string;

  maintenance_date: string;

  maintenance_type: string;

  pic: string;

  progress_status: string;

  description: string;

  created_at: string;
};

export function Maintenance() {
  const supabase = createClient();

  const { page, limit } = usePagination();

  const { keyword, handleKeywordChange } = useSearch();

  const [type, setType] = useState("all");

  const { data: maintenances = [], isLoading } = useQuery<MaintenanceType[]>({
    queryKey: ["maintenances", page, limit, keyword, type],

    queryFn: async () => {
      let query = supabase
        .from("maintenance_logs")
        .select("*")
        .range((page - 1) * limit, page * limit - 1)
        .order("created_at", {
          ascending: false,
        })
        .ilike("asset_name", `%${keyword}%`);

      if (type !== "all") {
        query = query.eq("maintenance_type", type);
      }

      const { data, error } = await query;

      if (error) {
        toast.error("Gagal", {
          description: error.message,
        });

        return [];
      }

      return data ?? [];
    },
  });

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-bold text-primary">Manajemen Maintenance</h1>

      {/* SEARCH + FILTER */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <Input
            type="search"
            placeholder="Cari data maintenance..."
            className="flex-1"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleKeywordChange(event.target.value)
            }
          />

          <div className="flex gap-3">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-[220px]">
                <Filter className="mr-2 h-4 w-4" />

                <SelectValue placeholder="Filter tipe maintenance" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>

                <SelectItem value="Rutin">Rutin</SelectItem>

                <SelectItem value="Perbaikan">Perbaikan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* TABLE */}
      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              {MAINTENANCE_TABLE_HEADER.map((head) => (
                <TableHead key={head} className="px-6 py-4">
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={MAINTENANCE_TABLE_HEADER.length}
                  className="h-24"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Spinner />

                    <span>Memuat...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : maintenances.length > 0 ? (
              maintenances.map((maintenance, index) => (
                <TableRow key={maintenance.id}>
                  {/* NO */}
                  <TableCell className="px-6 py-4">{index + 1}</TableCell>

                  {/* NAMA ASSET */}
                  <TableCell className="px-6 py-4">
                    {maintenance.asset_name}
                  </TableCell>

                  {/* TANGGAL */}
                  <TableCell className="px-6 py-4">
                    {maintenance.maintenance_date}
                  </TableCell>

                  {/* TIPE */}
                  <TableCell className="px-6 py-4">
                    {maintenance.maintenance_type}
                  </TableCell>

                  {/* PIC */}
                  <TableCell className="px-6 py-4">{maintenance.pic}</TableCell>

                  {/* STATUS */}
                  <TableCell className="px-6 py-4">
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

                  {/* KETERANGAN */}
                  <TableCell className="px-6 py-4">
                    {maintenance.description}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={MAINTENANCE_TABLE_HEADER.length}
                  className="h-32 text-center"
                >
                  Data maintenance belum tersedia
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
