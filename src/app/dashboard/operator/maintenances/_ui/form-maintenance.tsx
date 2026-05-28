"use client";

import Link from "next/link";

import { useSearchParams } from "next/navigation";

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

import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function FormMaintenance() {
  const searchParams = useSearchParams();

  const asset = searchParams.get("asset");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Form Tambah Maintenance</CardTitle>

        <CardDescription>
          Tambahkan data maintenance asset disini
        </CardDescription>
      </CardHeader>

      <form>
        <CardContent>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="asset_name">Nama Asset</FieldLabel>

                <Input
                  id="asset_name"
                  name="asset_name"
                  type="text"
                  defaultValue={asset ?? ""}
                  placeholder="Masukan nama asset"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="maintenance_date">
                  Tanggal Maintenance
                </FieldLabel>

                <Input
                  id="maintenance_date"
                  name="maintenance_date"
                  type="date"
                />
              </Field>

              <Field>
                <FieldLabel>Tipe Maintenance</FieldLabel>

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe maintenance" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Rutin">Rutin</SelectItem>

                    <SelectItem value="Perbaikan">Perbaikan</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Status Progress</FieldLabel>

                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status progress" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Planning">Planning</SelectItem>

                    <SelectItem value="Proses">Proses</SelectItem>

                    <SelectItem value="Selesai">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Keterangan</FieldLabel>

                <Textarea
                  id="description"
                  name="description"
                  placeholder="Masukan keterangan maintenance"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Link href="/dashboard/operator/maintenances">
            <Button type="button" variant="outline">
              Kembali
            </Button>
          </Link>

          <Button type="submit">Simpan</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
