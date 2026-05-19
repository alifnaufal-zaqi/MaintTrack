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
import { Select } from "@/components/ui/select";
import Link from "next/link";

export function FormLocations() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Form Pembuatan Lokasi</CardTitle>
        <CardDescription>Buat Lokasi anda Disini</CardDescription>
      </CardHeader>
      <form action="">
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Nama Lokasi</FieldLabel>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Masukan nama kategori aset"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="type">Tipe Lokasi</FieldLabel>
                <Select id="type" name="type" defaultValue="">
                  <option value="" disabled>
                    Pilih tipe lokasi
                  </option>
                  <option value="ruangan">Ruangan</option>
                  <option value="kantor">Kantor</option>
                  <option value="gedung">Gedung</option>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Deskripsi</FieldLabel>
                <Input
                  type="text"
                  id="description"
                  name="description"
                  placeholder="Masukan deskripsi lokasi"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        </CardContent>
        <CardFooter className="flex gap-2 justify-end mt-4">
          <Link href={"/dashboard/admin/master/locations"}>
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
