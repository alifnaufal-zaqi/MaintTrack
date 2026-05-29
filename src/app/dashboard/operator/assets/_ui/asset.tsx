"use client";

import { ActionButton } from "@/components/commons/action-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ASSET_TABLE_HEADER } from "@/constants/asset-constant";
import usePagination from "@/hooks/use-pagination";
import useSearch from "@/hooks/use-search";
import { createClient } from "@/lib/client";
import { AssetPreview } from "@/types/asset";
import { DialogState } from "@/types/dialog-state";
import { removeFileFromStorage } from "@/utils/remove-file-from-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

export function ListAssetsPage_Operator() {
  const supabase = createClient();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { handleKeywordChange, keyword } = useSearch();
  const { limit, page } = usePagination();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedAsset, setSelectedAsset] = useState<AssetPreview | null>();
  // fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select(`id,name`)
        .order("name");

      if (error) {
        toast.error("Gagal memuat kategori", { description: error.message });
      }

      return data as Array<{ id: string; name: string }> | null;
    },
  });

  // fetch locations for filter
  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select(`id,name`)
        .order("name");

      if (error) {
        toast.error("Gagal memuat lokasi", { description: error.message });
      }

      return data as Array<{ id: string; name: string }> | null;
    },
  });

  const { isLoading, data: assets } = useQuery<AssetPreview[] | null>({
    queryKey: ["assets", page, limit, keyword, selectedCategory, selectedLocation],
    queryFn: async () => {
      let query = supabase.from("assets").select(
        `
          id,
          name,
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
          status_asset,
          qr_tag,
          asset_image_url,
          asset_image_path
        `
      );

      if (keyword) {
        query = query.ilike("name", `%${keyword}%`);
      }

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      if (selectedLocation) {
        query = query.eq("current_location_id", selectedLocation);
      }

      query = query.order("created_at").range((page - 1) * limit, page * limit - 1);

      const { data, error } = await query;

      if (error) {
        toast.error("Gagal", { description: error.message });
      }

      return data as AssetPreview[] | null;
    },
  });
  

  const downloadQrCode = (tag: string, name: string) => {
    try {
      const svgMarkup = renderToStaticMarkup(
        <QRCodeSVG value={tag} size={256} />
      );
      const blob = new Blob([svgMarkup], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${name.replace(/\s+/g, "-").toLowerCase()}-qr.svg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Berhasil mengunduh QR", {
        description: "QR code telah diunduh sebagai file SVG.",
      });
    } catch (error) {
      toast.error("Gagal mengunduh QR", {
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan.",
      });
    }
  };

  return (
    <div className="w-full space-y-4">
      <h1 className="text-xl text-primary font-bold">Manajemen Data Aset</h1>

      <Card className="p-2 flex gap-2 flex-row items-center">
        <Input
          type="search"
          placeholder="Cari data aset berdasarkan nama"
          className="grow"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleKeywordChange(event.target.value)
          }
        />

        <div className="flex gap-2">
          <Select
            value={selectedCategory}
            onValueChange={(val) => setSelectedCategory(val)}
          >
            <SelectTrigger size="sm" className="w-44">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent id="category">
              <SelectItem value="all">Semua</SelectItem>
              {categories?.map((category: any) => (
                <SelectItem key={category.id} value={String(category.id || 'unknown')}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedLocation}
            onValueChange={(val) => setSelectedLocation(val)}
          >
            <SelectTrigger size="sm" className="w-44">
              <SelectValue placeholder="Lokasi" />
            </SelectTrigger>
            <SelectContent id="location">
              <SelectItem value="all">Semua</SelectItem>
              {locations?.map((location: any) => (
                <SelectItem key={location.id} value={String(location.id || 'unknown')}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="p-0">
        <Table className="w-full rounded-lg overflow-hidden">
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              {ASSET_TABLE_HEADER.map((head, index) => (
                <TableHead key={`${head}-${index}`} className="px-6 py-3">
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets?.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell className="px-6 py-3">
                  <Image
                    width={0}
                    height={0}
                    src={asset.asset_image_url}
                    alt={asset.name}
                    className="w-12 h-12 rounded-md object-cover border"
                  />
                </TableCell>
                <TableCell className="px-6 py-3">{asset.name}</TableCell>
                <TableCell className="px-6 py-3">
                  {asset.category.name}
                </TableCell>
                <TableCell className="px-6 py-3">{asset.vendor.name}</TableCell>
                <TableCell className="px-6 py-3">
                  {asset.current_location.name}
                </TableCell>
                <TableCell className="px-6 py-3">
                  <Badge>{asset.status_asset}</Badge>
                </TableCell>
                <TableCell className="px-6 py-3">
                  <ActionButton
                    isDetail
                    isDownloadQr
                    onDetailClick={() => {
                      router.push(`/dashboard/operator/assets/${asset.id}`);
                    }}
                    onDownloadQrClick={() => {
                      if (!asset.qr_tag) {
                        toast.error("QR tag tidak tersedia");
                        return;
                      }
                      downloadQrCode(asset.qr_tag, asset.name);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {assets?.length === 0 && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={ASSET_TABLE_HEADER.length}
                  className="h-24 text-center"
                >
                  Data belum tersedia
                </TableCell>
              </TableRow>
            )}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={ASSET_TABLE_HEADER.length} className="h-24">
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
