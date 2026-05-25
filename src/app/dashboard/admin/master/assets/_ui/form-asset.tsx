"use client";

import { DropzoneUpload } from "@/components/commons/dropzone-upload";
import { FieldInput } from "@/components/commons/field-input";
import { FieldSelect } from "@/components/commons/field-select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { FieldSet, FieldGroup } from "@/components/ui/field";
import { SelectItem } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useMasterData } from "@/hooks/use-mater-data";
import { createClient } from "@/lib/client";
import { AssetSchema } from "@/schemas/asset";
import { Asset, FormAsset, MutationAsset } from "@/types/asset";
import { Category } from "@/types/categories";
import { Location } from "@/types/locations";
import { Vendor } from "@/types/vendor";
import { calculateNextMaintenanceDate } from "@/utils/calculate-next-maintenance-date";
import { getUrlImage } from "@/utils/get-url-image";
import { uploadFileToStorage } from "@/utils/upload-file";
import { validateFormData } from "@/utils/validate-data";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SubmitEvent, useState } from "react";
import { toast } from "sonner";

export function FormCreateAsset() {
  const supabase = createClient();
  const router = useRouter();
  const [formError, setFormError] = useState<FormAsset | null>(null);
  const { mutate, isPending: loading } = useMutation({
    mutationFn: async (asset: MutationAsset) => {
      const { error } = await supabase.from("assets").insert({ ...asset });
      if (error) throw error;
    },
    onError: (error) => toast.error("Gagal", { description: error.message }),
    onSuccess: () => {
      toast.success("Berhasil", {
        description: "Berhasil menambahkan data aset",
      });
      router.push("/dashboard/admin/master/assets");
    },
  });
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

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { error: validationError, result } = validateFormData(
      formData,
      AssetSchema
    );

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError(null);
    const { data: updloadData, error: uploadError } = await uploadFileToStorage(
      result.image,
      "assets"
    );

    if (uploadError) {
      setFormError((prev) => ({ ...prev, image: [uploadError] }));
      return;
    }

    const urlImage = getUrlImage(updloadData!.path);

    mutate({
      name: result.name,
      category_id: result.category,
      vendor_id: result.vendor,
      current_location_id: result.location,
      purchase_price: parseInt(result.purchasePrice),
      purchase_date: result.purchaseDate,
      status: result.status,
      maintenance_interval: parseInt(result.maintenanceInterval),
      asset_image_url: urlImage,
      asset_image_path: updloadData!.path,
      qr_tag: `ASSET-${Date.now()}`,
      next_maintenance_date: calculateNextMaintenanceDate(
        parseInt(result.maintenanceInterval)
      ),
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Form Pembuatan Data Aset</CardTitle>
        <CardDescription>Buat Data Aset anda Disini</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <FieldInput
                label="Nama Aset"
                type="text"
                error={formError?.name?.[0]}
                id="name"
                name="name"
                placeholder="Masukan nama aset"
              />
              <FieldSelect
                label="Kategori"
                id="category"
                name="category"
                error={formError?.category?.[0]}
              >
                {categories?.map((category) => (
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
              >
                {vendors?.map((vendor) => (
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
              >
                {locations?.map((location) => (
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
              />
              <FieldInput
                error={formError?.purchaseDate?.[0]}
                id="date"
                label="Tanggal Beli"
                type="date"
                name="purchaseDate"
              />
              <FieldSelect
                label="Status Aset"
                id="status"
                name="status"
                error={formError?.status?.[0]}
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
                label="Perawatan Rutin"
                type="number"
              />
              <DropzoneUpload
                id="image"
                name="image"
                pathName="asset"
                label="Gambar Aset"
                error={formError?.image?.[0]}
              />
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className="flex gap-2 justify-end mt-4">
          <Link href={"/dashboard/admin/master/assets"}>
            <Button type="button" variant={"outline"} className="text-primary">
              Kembali
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner /> : "Simpan"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
