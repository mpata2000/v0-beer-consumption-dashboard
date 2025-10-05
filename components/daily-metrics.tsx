"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart } from "@mui/x-charts/PieChart";
import { DashboardData } from "@/lib/types";
import { DashboardModel } from "@/lib/dashboard-model";
import { useMemo } from "react";
import {
  RecordsCard,
  ConsumptionCard,
  HeatmapCard,
  CalendarHeatmapCard,
} from "@/components/daily";

interface DailyMetricsProps {
  data: DashboardData | null;
  hideChart?: boolean;
}

export function DailyMetrics({ data, hideChart = false }: DailyMetricsProps) {
  const model = new DashboardModel(data);
  const perDay: Record<string, number> = model.globalBeerPerDay();
  const chartDates = model.chartDates();

  // Find top global peak days (up to 3 records with top 3 unique values)
  const topGlobalDays = useMemo(() => model.topGlobalBeerDays(3, 3), [perDay]);

  // Find top individual records (up to 3 records with top 3 unique values)
  const topIndividualRecords = useMemo(
    () => model.topIndividualBeerRecords(3, 3),
    [data]
  );

  // Liters top cards data (moved from LitersMetrics)
  const perDayMl: Record<string, number> = model.globalMilliLitersPerDay();

  const litersTopGlobalDays = useMemo(
    () => model.topGlobalLiterDays(3, 3),
    [perDayMl]
  );

  const litersTopIndividualRecords = useMemo(
    () => model.topIndividualLiterRecords(3, 3),
    [data]
  );

  // -----------------------------
  // New: Time-range pie chart (global)
  // -----------------------------
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
    <div className="space-y-6">
      {/* Records Container */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecordsCard
          title="Beer Records"
          topGlobalDays={topGlobalDays}
          topIndividualRecords={topIndividualRecords}
          unit="beers"
        />
        <RecordsCard
          title="Liters Records"
          topGlobalDays={litersTopGlobalDays}
          topIndividualRecords={litersTopIndividualRecords}
          unit="liters"
        />
      </div>

      <ConsumptionCard model={model} />

      <CalendarHeatmapCard model={model} />

      {/* New Section: Heatmaps and Time-range insights */}
      <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
        <div className="flex-1 min-w-0 flex">
          <HeatmapCard data={data} />
        </div>

        <div className="flex-1 min-w-0 flex">
          <Card className="w-full h-full flex flex-col">
            <CardHeader>
              <CardTitle>Time Range Distribution</CardTitle>
              <CardDescription>Share of beers by time range</CardDescription>
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
                      //hideLegend={true}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
