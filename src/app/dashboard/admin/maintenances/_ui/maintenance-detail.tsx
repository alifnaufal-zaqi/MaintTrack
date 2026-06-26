"use client";

import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/client";
import { Maintenance } from "@/types/maintenance";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function MaintenanceDetail({ id }: { id: string }) {
  const supabase = createClient();

  const { data: maintenance, isLoading } = useQuery<{
    data: Maintenance | null;
  }>({
    queryKey: ["maintenances", id],
    queryFn: async () => {
      const { data, error } = await supabase
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
            notes,
            created_by:user_profiles!inner (
              fullname
            ),
            progress_status,
            created_at
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      return { data: data as unknown as Maintenance | null };
    },
  });

  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const data = maintenance?.data;

  if (!data) {
    return (
      <div className="w-full space-y-4">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/admin/maintenances">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Link>
        </Button>
        <div className="w-full h-48 flex items-center justify-center">
          <p>Data tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-primary">Detail Maintenance</h1>
        <div className="flex gap-2 items-center">
          <Button variant="outline" asChild>
            <Link href="/dashboard/admin/maintenances">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 flex flex-col items-center justify-center space-y-4 md:col-span-1">
          <Image
            src={data.asset.asset_image_url}
            alt={data.asset.name}
            width={200}
            height={200}
            className="rounded-lg object-cover w-full aspect-square"
          />
          <h2 className="text-lg font-semibold text-center">{data.asset.name}</h2>
          <Badge
            className="capitalize"
            variant={
              data.progress_status === "complete"
                ? "default"
                : data.progress_status === "process"
                ? "secondary"
                : "outline"
            }
          >
            {data.progress_status}
          </Badge>
        </Card>

        <Card className="p-6 space-y-6 md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tipe Maintenance</p>
              <p className="font-medium capitalize">{data.maintenance_type}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tanggal Maintenance</p>
              <p className="font-medium">{data.maintenance_date}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">PIC / Dibuat Oleh</p>
              <p className="font-medium">{data.created_by.fullname}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Biaya (Cost)</p>
              <p className="font-medium">{data.cost ? `Rp ${data.cost.toLocaleString("id-ID")}` : "-"}</p>
            </div>
          </div>
          <div className="space-y-1 border-t pt-4">
            <p className="text-sm text-muted-foreground">Catatan</p>
            <p className="font-medium whitespace-pre-wrap">
              {data.notes || "-"}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
