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

const MAINTENANCE_TABLE_HEADER = [
  "Nama Aset",
  "Teknisi",
  "Jenis Perawatan",
  "Jadwal",
  "Tenggat Waktu",
  "Biaya",
  "Status",
];

type Maintenance = {
  id: string;
  maintenance_date: string;
  maintenance_type: string;
  cost: number;
  notes: string;
  status: string;

  assets: {
    name: string;
  };

  user_profiles: {
    fullname: string;
  };
};

export function AssetsMaintenance() {
  const supabase = createClient();

  const { page, limit } = usePagination();

  const { keyword, handleKeywordChange } = useSearch();

  const { data: maintenances, isLoading } = useQuery<
    Maintenance[] | null
  >({
    queryKey: ["maintenances", page, limit, keyword],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_logs")
        .select(`
          *,
          assets(name),
          user_profiles(fullname)
        `)
        .range((page - 1) * limit, page * limit - 1)
        .order("maintenance_date")
        .ilike("notes", `%${keyword}%`);

      if (error) {
        toast.error("Gagal Memuat Data", {
          description: error.message,
        });
      }

      return data;
    },
  });

  return (
    <div className="w-full space-y-4">

      {/* TITLE */}
      <h1 className="text-xl font-bold text-primary">
        Administrasi Perawatan
      </h1>

      {/* SEARCH */}
      <Card className="p-2">

        <Input
          type="search"
          placeholder="Cari log perawatan..."
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
                <TableHead
                  key={head}
                  className="px-6 py-4 font-semibold"
                >
                  {head}
                </TableHead>
              ))}

            </TableRow>

          </TableHeader>

          {/* BODY */}
          <TableBody>

            {maintenances?.map((maintenance) => (

              <TableRow key={maintenance.id}>

                {/* NAMA ASET */}
                <TableCell className="px-6 py-5">

                  {maintenance.assets?.name}

                </TableCell>

                {/* TEKNISI */}
                <TableCell className="px-6 py-5">

                  {maintenance.user_profiles?.fullname}

                </TableCell>

                {/* JENIS */}
                <TableCell className="px-6 py-5">

                  {maintenance.maintenance_type}

                </TableCell>

                {/* JADWAL */}
                <TableCell className="px-6 py-5">

                  {maintenance.maintenance_date}

                </TableCell>

                {/* TENGGAT */}
                <TableCell className="px-6 py-5 text-red-500">

                  {maintenance.maintenance_date}

                </TableCell>

                {/* BIAYA */}
                <TableCell className="px-6 py-5">

                  Rp.
                  {maintenance.cost.toLocaleString("id-ID")}

                </TableCell>

                {/* STATUS */}
                <TableCell className="px-6 py-5">

                  <div
                    className={`
                      px-4 py-2 rounded-full text-center text-sm font-medium w-fit

                      ${
                        maintenance.status === "Selesai"
                          ? "bg-green-100 text-green-600"
                          : maintenance.status === "Proses"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-red-100 text-red-600"
                      }
                    `}
                  >

                    {maintenance.status}

                  </div>

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
                  Data perawatan belum tersedia
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

                    <span>Memuat data perawatan...</span>

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