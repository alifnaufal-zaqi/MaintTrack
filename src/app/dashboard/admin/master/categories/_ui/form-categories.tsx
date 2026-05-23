"use client";

import { postNewCategory } from "@/app/actions/create-category";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

export function FormCategories() {
  const [state, action, loading] = useActionState(postNewCategory, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.status === "success") {
      toast.success("Berhasil", { description: state.message });
      router.push("/dashboard/admin/master/categories");
    }

    if (state?.status === "error" && state.message) {
      toast.error("Gagal", { description: state.message });
    }
  }, [state, router]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Form Pembuatan Kategori Aset</CardTitle>
        <CardDescription>Buat Kategori Aset anda Disini</CardDescription>
      </CardHeader>
      <form action={action}>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nama Kategori</FieldLabel>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Masukan nama kategori aset"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className="flex gap-2 justify-end mt-4">
          <Link href={"/dashboard/admin/master/categories"}>
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
