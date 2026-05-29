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
import { toast } from "sonner";

export function ListAssetsPage() {
  const supabase = createClient();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { handleKeywordChange, keyword } = useSearch();
  const { limit, page } = usePagination();
  const [dialogState, setDialogState] = useState<DialogState>({
    delete: false,
    update: false,
  });
  const [selectedAsset, setSelectedAsset] = useState<AssetPreview | null>();
  const { isLoading, data: assets } = useQuery<AssetPreview[] | null>({
    queryKey: ["assets", page, limit, keyword],
    queryFn: async () => {
      const { error, data } = await supabase
        .from("assets")
        .select(
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
          asset_image_url,
          asset_image_path
        `
        )
        .range((page - 1) * limit, page * limit - 1)
        .order("created_at")
        .ilike("name", `%${keyword}%`);

      if (error) {
        toast.error("Gagal", { description: error.message });
      }

      return data as AssetPreview[] | null;
    },
  });
  const { mutate: mutationDelete, isPending: deleteLoading } = useMutation({
    mutationFn: async (asset: AssetPreview) => {
      const result = await removeFileFromStorage(asset.asset_image_path);

      if (!result) new Error("Gagal menghapus file");

      const { error } = await supabase
        .from("assets")
        .delete()
        .eq("id", asset.id);

      if (error) throw error;
    },
    onError: (error) => toast.error("Gagal", { description: error.message }),
    onSuccess: () => {
      setDialogState((prev) => ({ ...prev, delete: false }));
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      toast.success("Berhasil", {
        description: "Berhasil menghapus data aset",
      });
    },
  });

  return (
    <div className="w-full space-y-4">
      <h1 className="text-xl text-primary font-bold">Manajemen Data Aset</h1>

      <Card className="p-2 flex gap-2 flex-row">
        <Input
          type="search"
          placeholder="Cari data aset berdasarkan nama"
          className="grow"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleKeywordChange(event.target.value)
          }
        />
        <Link href={"/dashboard/admin/master/assets/create"}>
          <Button>
            <span>
              <Plus />
            </span>
            Tambah aset
          </Button>
        </Link>
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
                    isUpdate
                    isDelete
                    isDetail
                    onDetailClick={() =>
                      router.push(`/dashboard/admin/master/assets/${asset.id}`)
                    }
                    onDeleteClick={() => {
                      setSelectedAsset(asset);
                      setDialogState((prev) => ({ ...prev, delete: true }));
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

      <Dialog
        open={dialogState.delete}
        onOpenChange={(value) =>
          setDialogState((prev) => ({ ...prev, delete: value }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Peringatan</DialogTitle>
            <DialogDescription>
              Apakah anda yakin ingin menghapus kategori {selectedAsset?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={"outline"}>Batal</Button>
            </DialogClose>
            <Button
              variant={"destructive"}
              onClick={() => mutationDelete(selectedAsset!)}
            >
              {deleteLoading ? <Spinner /> : "Ya"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
