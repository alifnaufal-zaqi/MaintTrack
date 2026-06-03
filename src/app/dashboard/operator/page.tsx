import { BarChartData } from "@/components/commons/bar-chart";
import { PieChartData } from "@/components/commons/pie-chart";
import { StatisticCard } from "@/components/commons/statistic-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/server";
import { Boxes, CheckCircle2, CalendarCog, ClockAlert } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MaintTrack | Dashboard",
};

async function getDataCount(
  table: string,
  where?: {
    col: string;
    value: string;
    operator?: "eq" | "lt" | "gt" | "lte" | "gte";
  }
) {
  const supabase = await createClient();
  const query = supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (where) {
    const op = where.operator || "eq";

    switch (op) {
      case "eq":
        query.eq(where.col, where.value);
        break;
      case "lt":
        query.lt(where.col, where.value);
        break;
      case "gt":
        query.gt(where.col, where.value);
        break;
      case "lte":
        query.lte(where.col, where.value);
        break;
      case "gte":
        query.gte(where.col, where.value);
        break;
    }
  }

  const { count } = await query;
  return count as number;
}

export default async function DashboardAdminPage() {
  const today = new Date().toISOString().split("T")[0];
  const supabase = await createClient();
  const [
    totalAsset,
    totalAssetActive,
    totalMaintenanceToday,
    totalMaintenanceOverdue,
  ] = await Promise.all([
    getDataCount("assets"),
    getDataCount("assets", { col: "status_asset", value: "active" }),
    getDataCount("maintenances", {
      col: "maintenance_date",
      value: today,
    }),
    getDataCount("assets", {
      col: "next_maintenance_date",
      value: today,
      operator: "lt",
    }),
  ]);
  const { data: location, error: locationError } = await supabase
    .from("locations")
    .select(`name, assets(count)`);
  const { data: statusCount, error: statusError } = await supabase
    .from("assets_status_count")
    .select("*");

  if (locationError) {
    console.log(`Error: ${locationError.message}`);
    return;
  }

  if (statusError) {
    console.log(`Error: ${statusError.message}`);
    return;
  }

  return (
    <div className="w-full">
      <div className="w-full grid lg:grid-cols-4 grid-cols-2 gap-4">
        <StatisticCard
          label="Total Aset"
          data={totalAsset}
          icon={{ name: Boxes, color: "bg-green-300" }}
        />
        <StatisticCard
          label="Aset Aktif"
          data={totalAssetActive}
          icon={{ name: CheckCircle2, color: "bg-blue-300" }}
        />
        <StatisticCard
          label="Maintenance Hari Ini"
          data={totalMaintenanceToday}
          icon={{ name: CalendarCog, color: "bg-yellow-300" }}
        />
        <StatisticCard
          label="Maintenance Terlambat"
          data={totalMaintenanceOverdue}
          icon={{ name: ClockAlert, color: "bg-red-300" }}
        />
      </div>

      <div className="h-fit mt-4 flex lg:flex-row flex-col gap-4">
        <Card className="grow">
          <CardHeader>
            <CardTitle>Persebaran Aset berdasarkan Lokasi</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartData data={location} />
          </CardContent>
        </Card>
        <Card className="min-w-lg">
          <CardHeader>
            <CardTitle>Total Aset berdasarkan Status</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartData data={statusCount} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
