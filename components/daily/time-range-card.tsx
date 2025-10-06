"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart } from "@mui/x-charts/PieChart";
import { DashboardData } from "@/lib/types";
import { useMemo } from "react";

interface TimeRangeCardProps {
  data: DashboardData | null;
}

export function TimeRangeCard({ data }: TimeRangeCardProps) {
  const entries = data?.entries || [];

  const timeRangeTotals = useMemo(() => {
    const map: Record<string, number> = {};
    for (const e of entries) {
      if (!e.timeRange) continue;
      map[e.timeRange] = (map[e.timeRange] || 0) + 1;
    }
    return map;
  }, [entries]);

  const timeRangePieData = useMemo(() => {
    const entriesList = Object.entries(timeRangeTotals);
    const colors = [
      "#3b82f6",
      "#10b981",
      "#f59e0b",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
      "#06b6d4",
      "#f97316",
      "#22c55e",
      "#eab308",
      "#a855f7",
      "#14b8a6",
    ];
    return entriesList.map(([label, value], idx) => ({
      id: idx,
      label,
      value,
      color: colors[idx % colors.length],
    }));
  }, [timeRangeTotals]);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle>Distribución de Rango Horario</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {timeRangePieData.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No time range data
          </div>
        ) : (
          <div>
            <div>
              <PieChart
                series={[
                  {
                    data: timeRangePieData,
                    startAngle: -90,
                    endAngle: 270,
                    paddingAngle: 2,
                    innerRadius: "50%",
                    outerRadius: "90%",
                    highlightScope: { fade: "global", highlight: "item" },
                  },
                ]}
                width={undefined}
                height={260}
                slotProps={{
                  legend: {
                    direction: "vertical",
                    position: {
                      vertical: "middle",
                      horizontal: "center",
                    },
                    sx: {
                      fontSize: 14,
                      color: "white",
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
