"use client";

import { Camera } from "@/components/commons/camera";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  DROPDOWN_MENUS,
  MOVEMENTS_TABLE_HEADER,
} from "@/constants/movements-constant";
import usePagination from "@/hooks/use-pagination";
import useSearch from "@/hooks/use-search";
import { createClient } from "@/lib/client";
import { Movement } from "@/types/movements";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function AssetMovement() {
  const supabase = createClient();
  const { handleKeywordChange, keyword } = useSearch();
  const { limit, page } = usePagination();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const { data: movements, isLoading } = useQuery<
    Omit<Movement, "notes" | "created_at">[] | null
  >({
    queryKey: ["item_movements", keyword, page, limit],
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
            pic:user_profiles!inner (
                fullname
            )
        `
        )
        .range((page - 1) * limit, page * limit - 1)
        .order("created_at")
        .ilike("asset.name", `%${keyword}%`);

      if (error) {
        toast.error("Gagal", { description: error.message });
      }

      return data as Omit<Movement, "notes" | "created_at">[] | null;
    },
  });

  return (
    <div className="w-full space-y-4">
      <h1 className="text-xl font-bold text-primary">Perpindahan Aset</h1>

      <Card className="p-2 flex flex-row gap-2 items-center">
        <Input
          type="search"
          placeholder="Cari data perpindahan"
          onChange={(event) => handleKeywordChange(event.target.value)}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              Tambah
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" className="w-36">
            {DROPDOWN_MENUS.map((menu, index) => (
              <DropdownMenuItem
                key={`${menu.label}-${index}`}
                onClick={() => {
                  if (menu.label === "QRCode") {
                    setIsDialogOpen(true);
                  }
                }}
              >
                <menu.icon />
                <span>{menu.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>

      <Card className="p-0">
        <Table className="w-full rounded-lg overflow-hidden">
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              {MOVEMENTS_TABLE_HEADER.map((header, index) => (
                <TableHead
                  key={`${header}-${index}`}
                  className="capitalize px-6 py-3"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements?.map((movement) => (
              <TableRow key={movement.id}>
                <TableCell className="px-6 py-3">
                  <Image
                    alt={movement.asset.name}
                    src={movement.asset.asset_image_url}
                    width={0}
                    height={0}
                    className="w-12 h-12 rounded-md border"
                  />
                </TableCell>
                <TableCell className="px-6 py-3">
                  {movement.asset.name}
                </TableCell>
                <TableCell className="px-6 py-3">
                  {movement.from_location.name}
                </TableCell>
                <TableCell className="px-6 py-3">
                  {movement.to_location.name}
                </TableCell>
                <TableCell className="px-6 py-3">
                  {movement.movement_date}
                </TableCell>
                <TableCell className="px-6 py-3">
                  {movement.pic.fullname}
                </TableCell>
              </TableRow>
            ))}
            {movements?.length === 0 && !isLoading && (
              <TableRow>
                <TableCell
                  colSpan={MOVEMENTS_TABLE_HEADER.length}
                  className="h-24 text-center"
                >
                  Data belum tersedia
                </TableCell>
              </TableRow>
            )}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={MOVEMENTS_TABLE_HEADER.length}>
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

      <Dialog
        open={isDialogOpen}
        onOpenChange={(value) => setIsDialogOpen(value)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan QRCode Aset</DialogTitle>
            <DialogDescription>Scan QRCode Aset anda disini</DialogDescription>
          </DialogHeader>
          <Camera />
        </DialogContent>
      </Dialog>
    </div>
  );
}
