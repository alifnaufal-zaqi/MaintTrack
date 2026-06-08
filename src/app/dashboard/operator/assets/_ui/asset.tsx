"use client";

import { ActionButton } from "@/components/commons/action-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { ListCheck, Printer, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { AssetBarcode } from "@/components/commons/asset-barcode";

export function ListAssetsPage_Operator() {
  const supabase = createClient();
  const router = useRouter();
  const { handleKeywordChange, keyword } = useSearch();
  const { limit, page } = usePagination();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [isSelection, setIsSelection] = useState<boolean>(false);
  const [qrTags, setQrTags] = useState<string[]>([]);

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
    queryKey: [
      "assets",
      page,
      limit,
      keyword,
      selectedCategory,
      selectedLocation,
    ],
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

      if (selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory);
      }

      if (selectedLocation !== "all") {
        query = query.eq("current_location_id", selectedLocation);
      }

      query = query
        .order("created_at")
        .range((page - 1) * limit, page * limit - 1);

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
            onValueChange={(value) => setSelectedCategory(value)}
          >
            <SelectTrigger size="sm" className="w-44">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent id="category">
              <SelectItem value="all">Semua</SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedLocation}
            onValueChange={(value) => setSelectedLocation(value)}
          >
            <SelectTrigger size="sm" className="w-44">
              <SelectValue placeholder="Lokasi" />
            </SelectTrigger>
            <SelectContent id="location">
              <SelectItem value="all">Semua</SelectItem>
              {locations?.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div className="max-w-lg flex gap-2">
            <Button
              onClick={() => setIsSelection((prev) => !prev)}
              className={cn({ "bg-red-500": isSelection })}
            >
              {isSelection ? (
                <>
                  <X />
                  Batalkan
                </>
              ) : (
                <>
                  <ListCheck />
                  Cetak QRCode
                </>
              )}
            </Button>
            {isSelection && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Printer className="mr-2" />
                    Cetak QRCode
                  </Button>
                </DialogTrigger>
                <DialogContent className="print:static print:translate-x-0 print:translate-y-0 print:max-w-none print:w-full print:border-none print:shadow-none print:p-0">
                  <DialogHeader className="print:hidden">
                    <DialogTitle>Detail QrCode</DialogTitle>
                  </DialogHeader>
                  <div className="-mx-4 space-y-2 max-h-[50vh] no-scrollbar overflow-y-auto px-4 py-2 print:max-h-none print:overflow-visible print:space-y-0 print:p-0 print:m-0">
                    {qrTags.map((qr, index) => (
                      <Card
                        key={index}
                        className="p-2 print:border-none print:shadow-none print:w-full print:h-[100vh] print:flex print:items-center print:justify-center print:break-after-page"
                      >
                        <div className="print:scale-150">
                          <AssetBarcode tag={qr} margin="mx-auto" />
                        </div>
                      </Card>
                    ))}
                  </div>
                  <DialogFooter className="print:hidden">
                    <Button className="mx-auto" onClick={() => window.print()}>
                      <Printer className="mr-2" />
                      Cetak
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table className="w-full overflow-hidden border-t">
            <TableHeader className="bg-muted sticky top-0 z-10">
              <TableRow>
                {isSelection && (
                  <TableHead className="px-6 py-3">Check</TableHead>
                )}
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
                  {isSelection && (
                    <TableCell className="px-6 py-3">
                      <Checkbox
                        onCheckedChange={(checked) => {
                          if (checked === true) {
                            setQrTags((prev) => [...prev, asset.qr_tag]);
                          } else {
                            setQrTags((prev) =>
                              prev.filter((item) => item !== asset.qr_tag)
                            );
                          }
                        }}
                      />
                    </TableCell>
                  )}
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
                  <TableCell className="px-6 py-3">
                    {asset.vendor.name}
                  </TableCell>
                  <TableCell className="px-6 py-3">
                    {asset.current_location.name}
                  </TableCell>
                  <TableCell className="px-6 py-3">
                    <Badge>{asset.status_asset}</Badge>
                  </TableCell>
                  <TableCell className="px-6 py-3">
                    <ActionButton
                      isDetail
                      onDetailClick={() => {
                        router.push(`/dashboard/operator/assets/${asset.id}`);
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
                  <TableCell
                    colSpan={ASSET_TABLE_HEADER.length}
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
        </CardContent>
      </Card>
    </div>
  );
}
