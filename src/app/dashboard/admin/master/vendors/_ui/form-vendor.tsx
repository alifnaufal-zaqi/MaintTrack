"use client";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import Link from "next/link";

import { UploadCloud } from "lucide-react";

export function FormVendor() {
  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tambah Vendor Baru</h1>
      </div>

      <Card className="w-full">
        <form>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nama Vendor</label>

                    <Input placeholder="Masukkan nama vendor" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>

                    <Input type="email" placeholder="Masukkan email vendor" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nomor Kontak</label>

                    <Input placeholder="Masukkan nomor kontak vendor" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Alamat</label>

                    <Input placeholder="Masukkan alamat vendor" />
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-5 h-fit">
                <h3 className="font-medium text-center mb-4">Foto Logo</h3>

                <label
                  className="
                    border-2
                    border-dashed
                    rounded-lg
                    p-8
                    flex
                    flex-col
                    items-center
                    justify-center
                    cursor-pointer
                    text-center
                  "
                >
                  <UploadCloud className="h-10 w-10 text-muted-foreground" />

                  <span className="font-medium mt-2">Unggah Logo Vendor</span>

                  <p className="text-xs text-muted-foreground mt-2">
                    Tarik dan lepas file di sini atau klik untuk memilih file
                  </p>

                  <p className="text-xs text-muted-foreground mt-4">
                    PNG, JPG hingga 10MB
                  </p>

                  <Input type="file" className="hidden" />
                </label>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-3 border-t p-6">
            <Link href="/dashboard/admin/master/vendors">
              <Button type="button" variant="outline">
                Batal
              </Button>
            </Link>

            <Button type="submit">Simpan</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
