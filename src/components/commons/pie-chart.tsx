"use client";

import { STATUS_ASSET } from "@/constants/asset-constant";
import { useMemo } from "react";
import { ChartConfig } from "../ui/chart";
import { Pie, PieChart, Label } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type PieChartProps = {
  data: {
    status: (typeof STATUS_ASSET)[number];
    count: number;
  }[];
};

export function PieChartData({ data }: PieChartProps) {
  const { chartConfig, chartData } = useMemo(() => {
    const config: ChartConfig = {
      assetCount: { label: "Total Asset berdasarkan Status" },
      active: {
        label: "Aktif",
        color: "#06D001",
      },
      maintenance: {
        label: "Maintenance",
        color: "#FFB200",
      },
      nonactive: {
        label: "Tidak Aktif",
        color: "#EB5B00",
      },
      overdue: {
        label: "Terlambat Maintenance",
        color: "#FF0000",
      },
    };

    const resultData = data.map((item) => {
      const safeKey = item.status;
      return {
        statusLabel: item.status,
        count: item.count,
        fill: `var(--color-${safeKey})`,
      };
    });

    return { chartData: resultData, chartConfig: config };
  }, [data]);

  const totalAsset = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-96">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="count" // Angka yang menentukan besar irisan
          nameKey="statusLabel" // Label yang muncul di Tooltip
          innerRadius={60} // Membuat Pie Chart menjadi Donut Chart (Hapus ini jika ingin Pie penuh)
          strokeWidth={5} // Ketebalan garis batas antar irisan
        >
          {/* Teks di tengah Donut Chart */}
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {totalAsset}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 24}
                      className="fill-muted-foreground text-xs"
                    >
                      Total Aset
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
