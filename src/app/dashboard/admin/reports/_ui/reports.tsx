"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { REPORTS_TABLE_HEADER } from "@/constants/reports-constant";
import { Filter, Download } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import usePagination from "@/hooks/use-pagination";
import { createClient } from "@/lib/client";
import { toast } from "sonner";
import {
  ExportMaintenanceReport,
  ExportMovementReport,
  History,
} from "@/types/history";
import { getCurrentMonthBounds } from "@/utils/get-current-mount-bound";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";
import * as XLSX from "xlsx";

const ACTIVITY_TYPES = ["maintenance", "movement"] as const;
type ActivityType = (typeof ACTIVITY_TYPES)[number];

export function Reports() {
  const supabase = createClient();
  const { first, last } = getCurrentMonthBounds();
  const [startDate, setStartDate] = useState(first);
  const [endDate, setEndDate] = useState(last);
  const [activityType, setActivityType] = useState<ActivityType>("maintenance");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const { limit, page } = usePagination();
  const { data: historys, isLoading } = useQuery<{
    data: History[] | null;
    count: number | null;
  }>({
    queryKey: ["historys", page, limit, activityType, startDate, endDate],
    queryFn: async () => {
      const { count, data, error } = await supabase
        .from("historys")
        .select(
          `
            id,
            activity_type,
            created_at,
            asset:assets (
              name,
              category:categories (
                id,
                name
              ),
              asset_image_url,
              status_asset
            )
        `,
          { count: "exact" }
        )
        .eq("activity_type", activityType)
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .range((page - 1) * limit, page * limit - 1)
        .order("created_at");

      if (error) {
        toast.error("Gagal", { description: error.message });
      }

      return {
        data: data as unknown as History[],
        count,
      };
    },
  });

  // Handle download laporan dalam bentuk excel
  const handleExportReport = async () => {
    setIsExporting(true);
    let data: unknown[];

    if (activityType === "maintenance") {
      const { data: maintenances, error } = await supabase
        .from("maintenances")
        .select(
          `
          id,
          asset:assets!inner (
            name,
            category:categories (
              name
            ),
            vendor:vendors (
              name
            ),
            status_asset
          ),
          maintenance_date,
          maintenance_type,
          cost,
          pic:user_profiles (
            fullname
          ),
          progress_status
        `
        );

      if (error) {
        toast.error("Gagal", { description: error.message });
        return;
      }

      data = (maintenances as unknown as ExportMaintenanceReport[]).map(
        (item, index) => ({
          No: index + 1,
          "Id History": item.id,
          "Nama Aset": item.asset.name,
          "Status Aset": item.asset.status_asset,
          "Kategori Aset": item.asset.category.name,
          "Vendor Aset": item.asset.vendor.name,
          "Biaya Maintenance": item.cost,
          "Tanggal Maintenance": item.maintenance_date,
          "Jenis Maintenance": item.maintenance_type,
          "Progress Maintenance": item.progress_status,
          PIC: item.pic.fullname,
        })
      );
    } else {
      const { data: movements, error } = await supabase
        .from("asset_movements")
        .select(
          `
          id,
          movement_date,
          from_location:locations!asset_movements_from_location_id_fkey (
            name
          ),
          to_location:locations!asset_movements_to_location_id_fkey (
            name
          ),
          asset:assets!inner (
            name,
            category:categories (
              name
            ),
            vendor:vendors (
              name
            ),
            status_asset
          ),
          pic:user_profiles (
            fullname
          )
        `
        );

      if (error) {
        toast.error("Gagal", { description: error.message });
        return;
      }

      data = (movements as unknown as ExportMovementReport[]).map(
        (item, index) => ({
          No: index + 1,
          "Nama Aset": item.asset.name,
          "Status Aset": item.asset.status_asset,
          "Kategori Aset": item.asset.category.name,
          "Vendor Aset": item.asset.vendor.name,
          "Lokasi Asal": item.from_location.name,
          "Lokasi Tujuan": item.to_location.name,
          "Tanggal Pindah": item.movement_date,
          PIC: item.pic.fullname,
        })
      );
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan");

    const today = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `Laporan-${today}.xlsx`);

    setIsExporting(false);
  };

  return (
    <div className="w-full space-y-4">
      <h1 className="text-xl font-bold text-primary">Laporan Data Aset</h1>

      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Tanggal mulai
              </p>
              <Input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Tanggal selesai
              </p>
              <Input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-1 col-span-2">
              <p className="text-sm font-medium text-muted-foreground">
                Tipe aktivitas
              </p>
              <Select
                value={activityType}
                onValueChange={(value) =>
                  setActivityType(value as ActivityType)
                }
              >
                <SelectTrigger size="sm" className="w-full">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Pilih tipe aktivitas" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((item) => (
                    <SelectItem key={item} value={item} className="capitalize">
                      {item === "maintenance" ? "Maintenance" : "Movement"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleExportReport}
          >
            {isExporting ? (
              <Spinner />
            ) : (
              <>
                <Download />
                Export
              </>
            )}
          </Button>
        </div>
      </Card>

      <Card className="p-0">
        <Table className="w-full rounded-lg overflow-hidden">
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              {REPORTS_TABLE_HEADER.map((head) => (
                <TableHead key={head} className="capitalize px-6 py-3">
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {historys?.data?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={REPORTS_TABLE_HEADER.length}
                  className="h-24 text-center"
                >
                  Data belum tersedia
                </TableCell>
              </TableRow>
            )}
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={REPORTS_TABLE_HEADER.length}
                  className="h-24"
                >
                  <div className="flex flex-col gap-2 justify-center items-center w-full">
                    <Spinner />
                    <span>Memuat...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
            {historys?.data?.map((history, index) => (
              <TableRow key={history?.id}>
                <TableCell className="px-6 py-3">{index + 1}</TableCell>
                <TableCell className="px-6 py-3">
                  <Image
                    width={500}
                    height={500}
                    alt={history?.asset?.name ?? ""}
                    src={history?.asset?.asset_image_url ?? ""}
                    className="w-12 h-12 rounded-md border object-cover border"
                  />
                </TableCell>
                <TableCell className="px-6 py-3">
                  {history?.asset?.name}
                </TableCell>
                <TableCell className="px-6 py-3">
                  {history?.asset?.category?.name}
                </TableCell>
                <TableCell className="px-6 py-3">
                  <Badge className="capitalize">
                    {history?.asset?.status_asset}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
