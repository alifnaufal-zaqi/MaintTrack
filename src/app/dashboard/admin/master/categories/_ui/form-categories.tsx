"use client";

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
import Link from "next/link";

export function FormCategories() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Form Pembuatan Kategori Aset</CardTitle>
        <CardDescription>Buat Kategori Aset anda Disini</CardDescription>
      </CardHeader>
      <form action="">
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
            <Button type="submit" variant={"outline"} className="text-primary">
              Kembali
            </Button>
          </Link>
          <Button type="submit">Simpan</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
