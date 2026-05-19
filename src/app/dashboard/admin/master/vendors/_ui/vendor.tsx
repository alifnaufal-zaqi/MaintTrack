"use client";

import { ActionButton } from "@/components/commons/action-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

import usePagination from "@/hooks/use-pagination";
import useSearch from "@/hooks/use-search";

import { createClient } from "@/lib/client";

import { useQuery } from "@tanstack/react-query";

import { Plus } from "lucide-react";

import Link from "next/link";

import { ChangeEvent } from "react";

import { toast } from "sonner";

const VENDORS_TABLE_HEADER = [
  "Logo",
  "Nama Vendor",
  "Email",
  "Nomor Telepon",
  "Alamat",
  "Aksi",
];

type Vendor = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  logo_url: string;
};

export function AssetsVendors() {
  const supabase = createClient();

  const { page, limit } = usePagination();

  const { keyword, handleKeywordChange } = useSearch();

  const { data: vendors, isLoading } = useQuery<Vendor[] | null>({
    queryKey: ["vendors", page, limit, keyword],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .range((page - 1) * limit, page * limit - 1)
        .order("created_at")
        .ilike("name", `%${keyword}%`);

      if (error) {
        toast.error("Gagal Memuat Data", {
          description: error.message,
        });
      }

      return data;
    },
  });

  return (
    <div className="w-full space-y-4">

      {/* TITLE */}
      <h1 className="text-xl font-bold text-primary">
        Manajemen Data Vendor
      </h1>

      {/* SEARCH + BUTTON */}
      <Card className="p-2 flex flex-row gap-2 items-center">

        <Input
          type="search"
          placeholder="Cari data vendor..."
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleKeywordChange(event.target.value)
          }
        />

        <Link href={"/dashboard/admin/master/vendors/create"}>
          <Button>
            <Plus className="w-4 h-4 mr-1" />
            Tambah Vendor
          </Button>
        </Link>

      </Card>

      {/* TABLE */}
      <Card className="p-0 overflow-hidden">

        <Table className="w-full">

          {/* HEADER */}
          <TableHeader className="bg-muted">

            <TableRow>

              {VENDORS_TABLE_HEADER.map((head) => (
                <TableHead
                  key={head}
                  className="px-6 py-3 font-semibold"
                >
                  {head}
                </TableHead>
              ))}

            </TableRow>

          </TableHeader>

          {/* BODY */}
          <TableBody>

            {vendors?.map((vendor) => (

              <TableRow key={vendor.id}>

                {/* LOGO */}
                <TableCell className="px-6 py-3">

                  <img
                    src={vendor.logo_url}
                    alt={vendor.name}
                    className="w-12 h-12 rounded-md object-cover border"
                  />

                </TableCell>

                {/* NAME */}
                <TableCell className="px-6 py-3">
                  {vendor.name}
                </TableCell>

                {/* EMAIL */}
                <TableCell className="px-6 py-3">
                  {vendor.email}
                </TableCell>

                {/* PHONE */}
                <TableCell className="px-6 py-3">
                  {vendor.phone_number}
                </TableCell>

                {/* ADDRESS */}
                <TableCell className="px-6 py-3">
                  {vendor.address}
                </TableCell>

                {/* ACTION */}
                <TableCell className="px-6 py-3">
                  <ActionButton isDelete isUpdate />
                </TableCell>

              </TableRow>

            ))}

            {/* EMPTY */}
            {vendors?.length === 0 && !isLoading && (

              <TableRow>

                <TableCell
                  colSpan={VENDORS_TABLE_HEADER.length}
                  className="h-24 text-center"
                >
                  Data vendor belum tersedia
                </TableCell>

              </TableRow>

            )}

            {/* LOADING */}
            {isLoading && (

              <TableRow>

                <TableCell
                  colSpan={VENDORS_TABLE_HEADER.length}
                  className="h-24"
                >

                  <div className="flex flex-col justify-center items-center gap-2">

                    <Spinner />

                    <span>Memuat data vendor...</span>

                  </div>

                </TableCell>

              </TableRow>

            )}

          </TableBody>

        </Table>

      </Card>

    </div>
  );
}