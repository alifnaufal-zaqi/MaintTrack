"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table";
import { Plus } from "lucide-react";
import Link from "next/link";

export function ListAssetsPage() {
  return (
    <div className="w-full space-y-4">
      <h1 className="text-xl text-primary font-bold">Manajemen Data Aset</h1>

      <Card className="p-2">
        <Input
          type="search"
          placeholder="Cari data aset berdasarkan nama"
          className="grow"
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

      <Table></Table>
    </div>
  );
}
