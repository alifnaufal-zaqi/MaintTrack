"use client";

import { useMemo } from "react";
import { ChartConfig } from "../ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type BarChartProps = {
  data: {
    name: string;
    assets: { count: number }[];
  }[];
};

export function BarChartData({ data }: BarChartProps) {
  const { chartData, dynamicConfig } = useMemo(() => {
    const config: ChartConfig = {
      assetsCount: { label: "Total Aset" },
    };
    const resultData = data.map((item) => {
      const safeKey = item.name.replace(/\s+/g, "_");
      config[safeKey] = {
        label: item.name,
        color: "#002045",
      };

      return {
        location: safeKey,
        locationLabel: item.name,
        assetsCount: item.assets[0]?.count || 0,
        fill: "var(--color-primary)",
      };
    });

    return { chartData: resultData, dynamicConfig: config };
  }, [data]);

  return (
    <ChartContainer config={dynamicConfig} className="h-96 w-full">
      <BarChart data={chartData}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />

        <XAxis
          dataKey="locationLabel" // Tampilkan nama asli di sumbu X
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={10} />

        {/* Tooltip sekarang akan mengenali nama-nama lab tersebut */}
        <ChartTooltip content={<ChartTooltipContent />} />

        <Bar
          dataKey="assetsCount"
          // Tidak perlu set fill manual di sini, karena 'fill' sudah ada di dalam chartData
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
