"use client";

import { ChangeEvent, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MAINTENANCE_TABLE_HEADER,
  MAINTENANCE_TYPE,
} from "@/constants/maintenance-constant";
import usePagination from "@/hooks/use-pagination";
import useSearch from "@/hooks/use-search";
import { createClient } from "@/lib/client";
import type { Maintenance } from "@/types/maintenance";
import { useQuery } from "@tanstack/react-query";
import { Filter, MoreVertical, QrCode } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Camera } from "@/components/commons/camera";
import { useQrStore } from "@/lib/stores/qr-store";
import { useRouter } from "next/navigation";
import useTotalPage from "@/hooks/use-total-page";
import { PaginationButton } from "@/components/commons/pagination-button";

export function Maintenance() {
  const supabase = createClient();
  const { page, limit, handleLimitChange, handlePageChange } = usePagination();
  const setQrTag = useQrStore((state) => state.setTag);
  const router = useRouter();
  const { keyword, handleKeywordChange } = useSearch();
  const [type, setType] = useState<(typeof MAINTENANCE_TYPE)[number]>("all");
  const { data: maintenances, isLoading } = useQuery<{
    data: Omit<Maintenance, "notes">[] | null;
    count: number | null;
  }>({
    queryKey: ["maintenances", page, limit, keyword, type],
    queryFn: async () => {
      let query = supabase
        .from("maintenances")
        .select(
          `
              id,
              asset:assets!inner (
                  name,
                  asset_image_url
              ),
              maintenance_date,
              maintenance_type,
              cost,
              created_by:user_profiles!inner (
                fullname
              ),
              progress_status,
              created_at
        `,
          { count: "exact" }
        )
        .neq("progress_status", "complete")
        .range((page - 1) * limit, page * limit - 1)
        .order("created_at", {
          ascending: false,
        })
        .ilike("asset.name", `%${keyword}%`);

      if (type !== "all") {
        query = query.eq("maintenance_type", type);
      }

      const { data, error, count } = await query;

      if (error) {
        toast.error("Gagal", {
          description: error.message,
        });
      }

      return { data: data as Omit<Maintenance, "notes">[] | null, count };
    },
  });
  const { totalPage } = useTotalPage(maintenances, limit);

  const handleUpdateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("maintenances")
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

    toast.success("Berhasil", {
      description: "Status maintenance berhasil diperbarui",
    });

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
        <Select
          value={type}
          onValueChange={(value) => setType(value as typeof type)}
        >
          <SelectTrigger className="w-55">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter maintenance" />
          </SelectTrigger>
          <SelectContent>
            {MAINTENANCE_TYPE.map((item, index) => (
              <SelectItem
                value={item}
                key={`${item}-${index}`}
                className="capitalize"
              >
                {item === "all" ? "Semua" : item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <QrCode className="w-4 h-4 mr-2" />
              Scan QR
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Scan QRCode Aset</DialogTitle>
              <DialogDescription>
                Scan QRCode Aset anda disini
              </DialogDescription>
            </DialogHeader>
            <Camera
              onQrTagChange={(tag) => {
                setQrTag(tag);
                router.push("/dashboard/operator/maintenances/create");
              }}
            />
          </DialogContent>
        </Dialog>
      </Card>

      <Card className="p-0">
        <Table className="w-full rounded-lg overflow-hidden">
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              {MAINTENANCE_TABLE_HEADER.map((head, index) => (
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
            {maintenances?.data?.map((maintenance) => (
              <TableRow key={maintenance.id}>
                <TableCell className="px-6 py-3">
                  <Image
                    alt={maintenance.asset.name}
                    src={maintenance.asset.asset_image_url}
                    width={0}
                    height={0}
                    className="w-12 h-12 rounded-md border"
                  />
                </TableCell>
                <TableCell className="px-6 py-3">
                  {maintenance.asset.name}
                </TableCell>
                <TableCell className="px-6 py-3">
                  {maintenance.maintenance_date}
                </TableCell>
                <TableCell className="px-6 py-3 capitalize">
                  {maintenance.maintenance_type}
                </TableCell>
                <TableCell className="px-6 py-3">
                  <Badge
                    className="capitalize"
                    variant={
                      maintenance.progress_status === "process"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {maintenance.progress_status}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-3">{maintenance.cost}</TableCell>
                <TableCell className="px-6 py-3">
                  {maintenance.created_by.fullname}
                </TableCell>
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
                          handleUpdateStatus(maintenance.id, "pending")
                        }
                      >
                        Pending
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateStatus(maintenance.id, "procsess")
                        }
                      >
                        Proses
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleUpdateStatus(maintenance.id, "complete")
                        }
                      >
                        Selesai
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {maintenances?.data?.length === 0 && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={MAINTENANCE_TABLE_HEADER.length}
                  className="h-24 text-center"
                >
                  Data maintenance belum tersedia
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
