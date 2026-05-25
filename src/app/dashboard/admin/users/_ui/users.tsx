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

const USERS_TABLE_HEADER = [
  "No",
  "Nama",
  "Email",
  "Nomor Kontak",
  "Role",
  "Alamat",
  "Aksi",
];

type User = {
  id: string;
  user_id: string;
  fullname: string;
  phone_number: string;
  address: string;
  role: string;
  photo_profile_url?: string;
  created_at: string;
};

export function AssetsUsers() {
  const supabase = createClient();

  const { page, limit } = usePagination();

  const { handleKeywordChange, keyword } = useSearch();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["users", page, limit, keyword],

    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .range((page - 1) * limit, page * limit - 1)
        .order("created_at", {
          ascending: false,
        })
        .ilike("fullname", `%${keyword}%`);

      if (error) {
        toast.error("Gagal", {
          description: error.message,
        });

        return [];
      }

      return (data ?? []) as User[];
    },
  });

  return (
    <div className="w-full space-y-6">
      <h1 className="text-2xl font-bold text-primary">
        Manajemen Data Pengguna
      </h1>

      {/* Search + Button */}
      <Card className="p-3">
        <div className="flex items-center gap-3">
          <Input
            type="search"
            placeholder="Cari pengguna..."
            className="flex-1"
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              handleKeywordChange(event.target.value)
            }
          />

          <Link href="/dashboard/admin/users/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Buat Pengguna
            </Button>
          </Link>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              {USERS_TABLE_HEADER.map((head) => (
                <TableHead key={head} className="px-6 py-4">
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={USERS_TABLE_HEADER.length} className="h-24">
                  <div className="flex flex-col items-center gap-2">
                    <Spinner />

                    <span>Memuat...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : users.length > 0 ? (
              users.map((user, index) => (
                <TableRow key={user.id}>
                  <TableCell className="px-6 py-4">{index + 1}</TableCell>

                  <TableCell className="px-6 py-4">{user.fullname}</TableCell>

                  <TableCell className="px-6 py-4">
                    {user.phone_number}
                  </TableCell>

                  <TableCell className="px-6 py-4">{user.address}</TableCell>

                  <TableCell className="px-6 py-4 capitalize">
                    {user.role}
                  </TableCell>

                  <TableCell className="px-6 py-4">
                    <ActionButton isDelete isUpdate />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={USERS_TABLE_HEADER.length}
                  className="h-32 text-center"
                >
                  Data belum tersedia
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
