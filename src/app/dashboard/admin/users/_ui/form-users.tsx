"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import Link from "next/link";
import { UploadCloud } from "lucide-react";

export function FormUsers() {
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Tambah Pengguna Baru</h1>

        <p className="text-sm text-muted-foreground mt-1">
          Beranda &gt; Pengguna &gt; Tambah Pengguna
        </p>
      </div>

      <Card className="w-full">
        <form>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Form kiri */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Nama */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nama Pengguna</label>

                    <Input placeholder="Masukkan nama lengkap pengguna" />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>

                    <Input type="email" placeholder="Masukkan email pengguna" />
                  </div>

                  {/* Nomor Kontak */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nomor Kontak</label>

                    <Input placeholder="Masukkan nomor kontak pengguna" />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>

                    <Input
                      type="password"
                      placeholder="Masukkan password pengguna"
                    />
                  </div>

                  {/* Alamat */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Alamat</label>

                    <Input placeholder="Masukkan alamat pengguna" />
                  </div>
                </div>
              </div>

              {/* Upload Foto */}
              <div className="border rounded-lg p-5 h-fit">
                <h3 className="font-medium text-center mb-4">Foto Pengguna</h3>

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

                  <span className="font-medium mt-2">Unggah Foto Utama</span>

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
            <Link href="/dashboard/admin/users">
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
