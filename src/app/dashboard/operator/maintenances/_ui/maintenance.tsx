"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MAINTENANCE_TABLE_HEADER } from "@/constants/maintenance-constant";
import usePagination from "@/hooks/use-pagination";
import useSearch from "@/hooks/use-search";
import { createClient } from "@/lib/client";
import { Maintenance } from "@/types/maintenance";
import { useQuery } from "@tanstack/react-query";
import { Filter, MoreVertical } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { toast } from "sonner";

export function MaintenanceOperator() {
  const supabase = createClient();

  const { page, limit } = usePagination();

  const { keyword, handleKeywordChange } = useSearch();

  const [type, setType] = useState("all");

  const { data: maintenances, isLoading } = useQuery<Maintenance[] | null>({
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
      }

      return data;
    },
  });

  const handleUpdateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("maintenance_logs")
      .update({
        progress_status: status,
      })
      .eq("id", id);

    if (error) {
      toast.error("Gagal", {
        description: error.message,
      });

      return;
    }

    toast.success("Berhasil update status");

    window.location.reload();
  };

  return (
    <div className="w-full space-y-4">
      <h1 className="text-xl text-primary font-bold">Manajemen Maintenance</h1>

      <Card className="p-2 flex flex-row gap-2 items-center">
        <Input
          type="search"
          placeholder="Cari data maintenance..."
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleKeywordChange(event.target.value)
          }
        />

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
      </Card>

      <Card className="p-0">
        <Table className="w-full rounded-lg overflow-hidden">
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              {MAINTENANCE_TABLE_HEADER.map((head) => (
                <TableHead key={head} className="capitalize px-6 py-3">
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {maintenances?.map((maintenance, index) => (
              <TableRow key={maintenance.id}>
                {/* NO */}
                <TableCell className="px-6 py-3">{index + 1}</TableCell>

                {/* ASSET */}
                <TableCell className="px-6 py-3">
                  {maintenance.asset_name}
                </TableCell>

                {/* TANGGAL */}
                <TableCell className="px-6 py-3">
                  {maintenance.maintenance_date}
                </TableCell>

                {/* TIPE */}
                <TableCell className="px-6 py-3">
                  {maintenance.maintenance_type}
                </TableCell>

                {/* STATUS */}
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

                {/* KETERANGAN */}
                <TableCell className="px-6 py-3">
                  {maintenance.description}
                </TableCell>

                {/* AKSI */}
                <TableCell className="px-6 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateStatus(maintenance.id, "Planning")
                        }
                      >
                        Planning
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateStatus(maintenance.id, "Proses")
                        }
                      >
                        Proses
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateStatus(maintenance.id, "Selesai")
                        }
                      >
                        Selesai
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
