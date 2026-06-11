"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { REPORTS_TABLE_HEADER } from "@/constants/reports-constant";
import { STATUS_ASSET } from "@/constants/asset-constant";
import { Filter, CalendarDays } from "lucide-react";
import { useState } from "react";

const ACTIVITY_TYPES = ["maintenance", "movement"] as const;

type ActivityType = (typeof ACTIVITY_TYPES)[number];

const reportRows = [] as Array<{
  id: string;
  image: string;
  name: string;
  category: string;
  status: string;
}>;

export function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activityType, setActivityType] = useState<ActivityType>("maintenance");
  const [statusAsset, setStatusAsset] = useState<string>("all");

  return (
    <div className="w-full space-y-4">
      <h1 className="text-xl font-bold text-primary">Laporan Data Aset</h1>

      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Tanggal mulai</p>
              <Input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Tanggal selesai</p>
              <Input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Tipe aktivitas</p>
              <Select
                value={activityType}
                onValueChange={(value) => setActivityType(value as ActivityType)}
              >
                <SelectTrigger size="sm" className="w-full">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Pilih tipe aktivitas" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_TYPES.map((item) => (
                    <SelectItem key={item} value={item} className="capitalize">
                      {item === "maintenance" ? "Maintenance" : "Movement"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Status aset</p>
              <Select value={statusAsset} onValueChange={(value) => setStatusAsset(value)}>
                <SelectTrigger size="sm" className="w-full">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua status</SelectItem>
                  {STATUS_ASSET.map((item) => (
                    <SelectItem key={item} value={item} className="capitalize">
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button variant="outline" className="w-full sm:w-auto">
            Export
          </Button>
        </div>
      </Card>

      <Card className="p-0">
        <Table className="w-full rounded-lg overflow-hidden">
          <TableHeader className="bg-muted sticky top-0 z-10">
            <TableRow>
              {REPORTS_TABLE_HEADER.map((head) => (
                <TableHead key={head} className="capitalize px-6 py-3">
                  {head}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={REPORTS_TABLE_HEADER.length} className="h-24 text-center">
                  Data belum tersedia
                </TableCell>
              </TableRow>
            ) : (
              reportRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="px-6 py-3">
                    <img
                      alt={row.name}
                      src={row.image}
                      className="w-12 h-12 rounded-md border object-cover"
                    />
                  </TableCell>
                  <TableCell className="px-6 py-3">{row.name}</TableCell>
                  <TableCell className="px-6 py-3">{row.category}</TableCell>
                  <TableCell className="px-6 py-3">
                    <Badge className="capitalize">{row.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
