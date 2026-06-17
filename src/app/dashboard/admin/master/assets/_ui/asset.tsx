"use client";

import { ActionButton } from "@/components/commons/action-button";
import { DropzoneUpload } from "@/components/commons/dropzone-upload";
import { FieldInput } from "@/components/commons/field-input";
import { FieldSelect } from "@/components/commons/field-select";
import { PaginationButton } from "@/components/commons/pagination-button";
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
import { FieldSet, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SelectItem } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ASSET_TABLE_HEADER, STATUS_ASSET } from "@/constants/asset-constant";
import { useMasterData } from "@/hooks/use-mater-data";
import usePagination from "@/hooks/use-pagination";
import useSearch from "@/hooks/use-search";
import useTotalPage from "@/hooks/use-total-page";
import { createClient } from "@/lib/client";
import { AssetUpdateSchema } from "@/schemas/asset-update";
import { AssetPreviewEditable, FormAsset } from "@/types/asset";
import { Category } from "@/types/categories";
import { DialogState } from "@/types/dialog-state";
import { Location } from "@/types/locations";
import { Vendor } from "@/types/vendor";
import { calculateNextMaintenanceDate } from "@/utils/calculate-next-maintenance-date";
import { getUrlImage } from "@/utils/get-url-image";
import { removeFileFromStorage } from "@/utils/remove-file-from-storage";
import { validateFormData } from "@/utils/validate-data";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, SubmitEvent, useState } from "react";
import { toast } from "sonner";

export function ListAssetsPage() {
  const supabase = createClient();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { handleKeywordChange, keyword } = useSearch();
  const { limit, page, handleLimitChange, handlePageChange } = usePagination();
  const [dialogState, setDialogState] = useState<DialogState>({
    delete: false,
    update: false,
  });
  const [selectedAsset, setSelectedAsset] =
    useState<AssetPreviewEditable | null>(null);
  const [formError, setFormError] = useState<FormAsset | null>(null);
  const { isLoading, data: assets } = useQuery<{
    data: AssetPreviewEditable[] | null;
    count: number | null;
  }>({
    queryKey: ["assets", page, limit, keyword],
    queryFn: async () => {
      const { error, data, count } = await supabase
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
          asset_image_path,
          purchase_price,
          purchase_date,
          maintenance_interval
        `,
          { count: "exact" }
        )
        .range((page - 1) * limit, page * limit - 1)
        .order("created_at")
        .ilike("name", `%${keyword}%`);

      if (error) {
        toast.error("Gagal", { description: error.message });
      }

      return { data: data as AssetPreviewEditable[] | null, count };
    },
  });
  const { mutate: mutationDelete, isPending: deleteLoading } = useMutation({
    mutationFn: async (asset: AssetPreviewEditable) => {
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
  const { mutate: mutationUpdate, isPending: updateLoading } = useMutation({
    mutationFn: async (asset: {
      id: string;
      name: string;
      category_id: string;
      vendor_id: string;
      current_location_id: string;
      purchase_price: number;
      purchase_date: string;
      status_asset: string;
      maintenance_interval: number;
      next_maintenance_date: string;
      asset_image_url: string;
      asset_image_path: string;
    }) => {
      const { id, ...updateData } = asset;
      const { error } = await supabase
        .from("assets")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onError: (error) => toast.error("Gagal", { description: error.message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      setDialogState((prev) => ({ ...prev, update: false }));
      toast.success("Berhasil", {
        description: "Berhasil mengedit data aset",
      });
    },
  });
  const { totalPage } = useTotalPage(assets, limit);

  // Fetch master data for select options in the edit form
  const { data: categories } = useMasterData<Pick<Category, "id" | "name">[]>({
    table: "categories",
    select: "id, name",
    key: ["categories"],
  });
  const { data: vendors } = useMasterData<Pick<Vendor, "id" | "name">[]>({
    table: "vendors",
    select: "id, name",
    key: ["vendors"],
  });
  const { data: locations } = useMasterData<Pick<Location, "id" | "name">[]>({
    table: "locations",
    select: "id, name",
    key: ["locations"],
  });

  const handleUpdate = async (
    event: SubmitEvent<HTMLFormElement>,
    asset: AssetPreviewEditable
  ) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const { error: validationError, result } = validateFormData(
      formData,
      AssetUpdateSchema
    );

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);

    let imageUrl = asset.asset_image_url;
    let imagePath = asset.asset_image_path;

    const file = formData.get("image") as File;
    if (file && file.size > 0) {
      // User uploaded a new image — update in storage
      const { data: updateFileData, error: updateFileError } =
        await supabase.storage
          .from("MaintTrack-Assets")
          .update(asset.asset_image_path, file, {
            contentType: file.type,
          });

      if (updateFileError) {
        toast.error("Gagal", { description: updateFileError.message });
        return;
      }

      imagePath = updateFileData.path;
      imageUrl = getUrlImage(updateFileData.path);
    }

    mutationUpdate({
      id: asset.id,
      name: result.name,
      category_id: result.category,
      vendor_id: result.vendor,
      current_location_id: result.location,
      purchase_price: parseInt(result.purchasePrice),
      purchase_date: result.purchaseDate,
      status_asset: result.status_asset,
      maintenance_interval: parseInt(result.maintenanceInterval),
      next_maintenance_date: calculateNextMaintenanceDate(
        parseInt(result.maintenanceInterval)
      ),
      asset_image_url: imageUrl,
      asset_image_path: imagePath,
    });
  };

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
            {assets?.data?.map((asset) => (
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
                    onUpdateClick={() => {
                      setSelectedAsset(asset);
                      setFormError(null);
                      setDialogState((prev) => ({ ...prev, update: true }));
                    }}
                    onDeleteClick={() => {
                      setSelectedAsset(asset);
                      setDialogState((prev) => ({ ...prev, delete: true }));
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
            {assets?.data?.length === 0 && !isLoading && (
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
      <PaginationButton
        currentLimit={limit}
        currentPage={page}
        onChangeLimit={handleLimitChange}
        onChangePage={handlePageChange}
        totalPages={totalPage}
      />

      {/* DELETE */}
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
              Apakah anda yakin ingin menghapus aset {selectedAsset?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={"outline"}>Batal</Button>
            </DialogClose>
            <Button
              variant={"destructive"}
              disabled={deleteLoading}
              onClick={() => mutationDelete(selectedAsset!)}
            >
              {deleteLoading ? <Spinner /> : "Ya"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT */}
      {selectedAsset && (
        <Dialog
          open={dialogState.update}
          onOpenChange={(value) =>
            setDialogState((prev) => ({ ...prev, update: value }))
          }
        >
          <DialogContent className="w-full lg:max-w-1/2 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Form Edit Aset</DialogTitle>
              <DialogDescription>
                Edit data aset anda disini
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(event) => handleUpdate(event, selectedAsset)}>
              <FieldSet>
                <FieldGroup>
                  <FieldInput
                    label="Nama Aset"
                    type="text"
                    error={formError?.name?.[0]}
                    id="name"
                    name="name"
                    placeholder="Masukan nama aset"
                    defaultValue={selectedAsset.name}
                  />
                  <FieldSelect
                    label="Kategori"
                    id="category"
                    name="category"
                    error={formError?.category?.[0]}
                    defaultValue={selectedAsset.category.id}
                  >
                    {categories?.data?.map((category) => (
                      <SelectItem value={category.id} key={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </FieldSelect>
                  <FieldSelect
                    label="Vendor"
                    id="vendor"
                    name="vendor"
                    error={formError?.vendor?.[0]}
                    defaultValue={selectedAsset.vendor.id}
                  >
                    {vendors?.data?.map((vendor) => (
                      <SelectItem value={vendor.id} key={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </FieldSelect>
                  <FieldSelect
                    label="Lokasi"
                    id="location"
                    name="location"
                    error={formError?.location?.[0]}
                    defaultValue={selectedAsset.current_location.id}
                  >
                    {locations?.data?.map((location) => (
                      <SelectItem value={location.id} key={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </FieldSelect>
                  <FieldInput
                    error={formError?.purchasePrice?.[0]}
                    id="price"
                    name="purchasePrice"
                    label="Harga Beli"
                    type="number"
                    defaultValue={selectedAsset.purchase_price}
                  />
                  <FieldInput
                    error={formError?.purchaseDate?.[0]}
                    id="date"
                    label="Tanggal Beli"
                    type="date"
                    name="purchaseDate"
                    defaultValue={selectedAsset.purchase_date}
                  />
                  <FieldSelect
                    label="Status Aset"
                    id="status"
                    name="status_asset"
                    error={formError?.status_asset?.[0]}
                    defaultValue={selectedAsset.status_asset}
                  >
                    {STATUS_ASSET.map((item, index) => (
                      <SelectItem
                        value={item}
                        key={`${item}-${index}`}
                        className="capitalize"
                      >
                        {item}
                      </SelectItem>
                    ))}
                  </FieldSelect>
                  <FieldInput
                    error={formError?.maintenanceInterval?.[0]}
                    id="interval"
                    name="maintenanceInterval"
                    label="Perawatan Rutin (bulan)"
                    type="number"
                    defaultValue={selectedAsset.maintenance_interval}
                  />
                  <DropzoneUpload
                    id="image"
                    name="image"
                    pathName="asset"
                    label="Gambar Aset (opsional)"
                    error={formError?.image?.[0]}
                  />
                </FieldGroup>
              </FieldSet>

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline">Batal</Button>
                </DialogClose>
                <Button type="submit" disabled={updateLoading}>
                  {updateLoading ? <Spinner /> : "Edit"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
