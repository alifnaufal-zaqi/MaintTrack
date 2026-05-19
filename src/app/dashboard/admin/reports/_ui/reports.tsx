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

import usePagination from "@/hooks/use-pagination";
import useSearch from "@/hooks/use-search";
import { createClient } from "@/lib/client";

import { useQuery } from "@tanstack/react-query";
import { ChangeEvent } from "react";
import { toast } from "sonner";

const REPORTS_TABLE_HEADER = [
  "No",
  "Nama Aset",
  "Teknisi",
  "Lokasi",
  "Terakhir Perawatan",
  "Status",
];

type Report = {
  id: string;
  asset_name: string;
  technician: string;
  location: string;
  terakhir_perawatan: string;
  status: string;
  created_at: string;
};

export function AssetsReports() {
  const supabase = createClient();

  const { page, limit } = usePagination();

  const { handleKeywordChange, keyword } = useSearch();

  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ["reports", page, limit, keyword],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance")
        .select("*")
        .range((page - 1) * limit, page * limit - 1)
        .order("created_at", {
          ascending: false,
        })
        .ilike("asset_name", `%${keyword}%`);

      if (error) {
        toast.error("Gagal", {
          description: error.message,
        });

        return [];
      }

      return (data ?? []) as Report[];
    },
  });

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-bold text-primary">Laporan Analitik Aset</h1>

      {/* Search */}
      <Card className="p-3">
        <div className="flex items-center gap-3">
          <Input
            type="search"
            placeholder="Cari laporan..."
            className="flex-1"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleKeywordChange(event.target.value)
            }
          />
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              {REPORTS_TABLE_HEADER.map((head) => (
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
                  colSpan={REPORTS_TABLE_HEADER.length}
                  className="h-24"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Spinner />

                    <span>Memuat...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : reports.length > 0 ? (
              reports.map((report, index) => (
                <TableRow key={report.id}>
                  <TableCell className="px-6 py-4">{index + 1}</TableCell>

                  <TableCell className="px-6 py-4">
                    {report.asset_name}
                  </TableCell>

                  <TableCell className="px-6 py-4">
                    {report.technician}
                  </TableCell>

                  <TableCell className="px-6 py-4">{report.location}</TableCell>

                  <TableCell className="px-6 py-4">
                    {report.terakhir_perawatan}
                  </TableCell>

                  <TableCell className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm
                        ${
                          report.status === "Aktif"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                    >
                      {report.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={REPORTS_TABLE_HEADER.length}
                  className="h-32 text-center"
                >
                  Data laporan belum tersedia
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
