"use client";

import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/client";
import { Movement } from "@/types/movements";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export function MovementDetail({ id }: { id: string }) {
  const supabase = createClient();

  const { data: movement, isLoading } = useQuery<{
    data: Movement | null;
  }>({
    queryKey: ["item_movements", id],
    queryFn: async () => {
      const { data, error } = await supabase
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
            notes,
            created_at,
            pic:user_profiles!inner (
                fullname
            )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      return { data: data as unknown as Movement | null };
    },
  });

  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const data = movement?.data;

  if (!data) {
    return (
      <div className="w-full space-y-4">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/dashboard/admin/movements">
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">Detail Perpindahan Aset</h1>
        <Button variant="outline" asChild>
          <Link href="/dashboard/admin/movements">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Link>
        </Button>
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
        </Card>

        <Card className="p-6 space-y-6 md:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Lokasi Awal</p>
              <p className="font-medium">{data.from_location.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Lokasi Tujuan</p>
              <p className="font-medium">{data.to_location.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Tanggal Pindah</p>
              <p className="font-medium">{data.movement_date}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">PIC</p>
              <p className="font-medium">{data.pic.fullname}</p>
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
