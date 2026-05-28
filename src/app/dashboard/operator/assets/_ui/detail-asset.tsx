"use client";

import { AssetBarcode } from "@/components/commons/asset-barcode";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { createClient } from "@/lib/client";
import { Asset } from "@/types/asset";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Info, QrCodeIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function DetailAsset({ id }: { id: string }) {
  const supabase = createClient();
  const router = useRouter();
  const { data: asset } = useQuery<Asset | null>({
    queryKey: ["detail-asset"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assets")
        .select(
          `
          id,
          name,
          purchase_price,
          purchase_date,
          qr_tag,
          last_maintenance_date,
          next_maintenance_date,
          category:categories (
            id,
            name
          ),
          vendor:vendors (
            id,
            name
          ),
          current_location:locations!assets_current_location_id_fkey (
            id,
            name
          ),
          status,
          asset_image_url
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        toast.success("Gagal", { description: error.message });
      }

      return data as Asset | null;
    },
  });

  return (
    <div className="p-4 w-full">
      <div className="flex gap-2 item-center">
        <Button
          size={"icon"}
          variant={"outline"}
          onClick={() => router.push("/dashboard/operator/assets")}
        >
          <ChevronLeft />
        </Button>
        <h2 className="text-xl font-bold mb-4">Detail Data Aset</h2>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full">
        <Card className="p-4 w-full col-span-2">
          <CardHeader>
            <CardTitle className="flex justify-between">
              <div className="flex items-center gap-2">
                <Info />
                <span>Informasi Utama</span>
              </div>

              <Badge>{asset?.status}</Badge>
            </CardTitle>
            <CardContent className="grid grid-cols-3 gap-x-4 gap-y-8 p-0 pb-8 mt-4">
              <div>
                <h3 className="text-md text-muted-foreground">Nama Aset</h3>
                <p className="text-lg font-semibold">{asset?.name}</p>
              </div>
              <div>
                <h3 className="text-md text-muted-foreground">Kategori Aset</h3>
                <p className="text-lg font-semibold">{asset?.category?.name}</p>
              </div>
              <div>
                <h3 className="text-md text-muted-foreground">Vendor Aset</h3>
                <p className="text-lg font-semibold">{asset?.vendor?.name}</p>
              </div>
              <div>
                <h3 className="text-md text-muted-foreground">Lokasi Aset</h3>
                <p className="text-lg font-semibold">
                  {asset?.current_location?.name}
                </p>
              </div>
              <div>
                <h3 className="text-md text-muted-foreground">
                  Tanggal Beli Aset
                </h3>
                <p className="text-lg font-semibold">{asset?.purchase_date}</p>
              </div>
              <div>
                <h3 className="text-md text-muted-foreground">
                  Harga Beli Aset
                </h3>
                <p className="text-lg font-semibold">{asset?.purchase_price}</p>
              </div>
            </CardContent>
            <CardFooter className="grid-cols-2 gap-4 px-0 bg-white">
              <Card className="p-4 text-center space-y-1">
                <h3 className="text-md text-muted-foreground">
                  Maintenance Terakhir
                </h3>
                <p className="text-lg font-semibold">
                  {asset?.last_maintenance_date === null
                    ? "-"
                    : asset?.last_maintenance_date}
                </p>
              </Card>
              <Card className="p-4 text-center space-y-1">
                <h3 className="text-md text-muted-foreground">
                  Maintenance Selanjutnya
                </h3>
                <p className="text-lg font-semibold">
                  {asset?.next_maintenance_date}
                </p>
              </Card>
            </CardFooter>
          </CardHeader>
        </Card>
        <div className="flex lg:flex-col flex-row gap-4 items-center">
          <Card className="p-2 max-h-96 w-full">
            <Image
              width={0}
              height={0}
              className="w-full h-full object-cover"
              alt={asset?.name as string}
              src={asset?.asset_image_url as string}
            />
          </Card>
          <Card className="p-4 w-fit">
            <Card className="p-2">
              <AssetBarcode tag={asset?.["qr_tag"] as string} />
            </Card>
            <Button>
              <QrCodeIcon />
              <span>Cetak QR Code</span>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
