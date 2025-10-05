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
import {
  monthMetaFromKey,
  parseIsoDateToUTC,
} from "@/lib/utils";
import { useMemo, useState } from "react";
import { RecordsCard, ConsumptionCard, HeatmapCard } from "@/components/daily";

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
  // New: Calendar Heatmap (per-day in selected month)
  // -----------------------------
  const entries = data?.entries || [];

  const monthKeys = useMemo(() => model.monthKeys(), [perDay]);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    () => monthKeys[monthKeys.length - 1] || ""
  );

  const monthDailyCounts = useMemo(
    () => (selectedMonth ? model.monthDailyCounts(selectedMonth) : {}),
    [perDay, selectedMonth]
  );

  const monthMeta = useMemo(() => {
    if (!selectedMonth)
      return { year: 0, monthIndex: 0, daysInMonth: 0, firstWeekday: 0 };
    const v = monthMetaFromKey(selectedMonth);
    return {
      year: v.year,
      monthIndex: v.monthIndex,
      daysInMonth: v.daysInMonth,
      firstWeekday: v.firstWeekdayMondayFirst,
    };
  }, [selectedMonth]);

  const monthMax = useMemo(() => {
    let max = 0;
    Object.values(monthDailyCounts).forEach((v) => {
      if (v > max) max = v;
    });
    return max;
  }, [monthDailyCounts]);

  function intensityColor(value: number, maxValue: number): string {
    if (!maxValue || value <= 0) return "rgba(59,130,246,0.08)"; // faint
    const t = Math.min(1, value / maxValue);
    // blue scale from light to strong
    const alpha = 0.25 + 0.55 * t;
    return `rgba(59,130,246,${alpha})`;
  }

  function formatMonthLabel(key: string) {
    if (!key) return "";
    const [y, m] = key.split("-").map((v) => parseInt(v, 10));
    const dt = new Date(Date.UTC(y, m - 1, 1));
    const month = dt.toLocaleString("en-US", {
      month: "long",
      timeZone: "UTC",
    });
    return `${month} ${y}`;
  }


  const weekRows = useMemo(() => {
    const rows: Array<
      Array<{ day: number | null; dateStr: string | null; count: number }>
    > = [];
    if (!selectedMonth) return rows;
    const { year, monthIndex, daysInMonth, firstWeekday } = monthMeta;
    let currentDay = 1;
    for (let r = 0; r < 6; r++) {
      const row: Array<{
        day: number | null;
        dateStr: string | null;
        count: number;
      }> = [];
      for (let c = 0; c < 7; c++) {
        const cellIndex = r * 7 + c;
        if (cellIndex < firstWeekday || currentDay > daysInMonth) {
          row.push({ day: null, dateStr: null, count: 0 });
        } else {
          const day = currentDay;
          const date = new Date(year, monthIndex, day);
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          const dd = String(date.getDate()).padStart(2, "0");
          const key = `${yyyy}-${mm}-${dd}`;
          row.push({ day, dateStr: key, count: monthDailyCounts[key] || 0 });
          currentDay += 1;
        }
      }
      rows.push(row);
    }
    return rows;
  }, [selectedMonth, monthMeta, monthDailyCounts]);

  // -----------------------------
  // New: Time-range pie chart (global)
  // -----------------------------
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

      {/* New Section: Heatmaps and Time-range insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Calendar Heatmap</CardTitle>
            <CardDescription>
              Select a month to see beers per day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4 gap-4">
              <div className="text-sm text-muted-foreground">
                {selectedMonth ? formatMonthLabel(selectedMonth) : "No data"}
              </div>
              <select
                className="bg-transparent border border-border rounded-md px-2 py-1 text-sm"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {monthKeys.map((m) => (
                  <option key={m} value={m}>
                    {formatMonthLabel(m)}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-muted-foreground">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <div key={d} className="text-center">
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-rows-6 gap-1">
                  {weekRows.map((row, ri) => (
                    <div key={ri} className="grid grid-cols-7 gap-1">
                      {row.map((cell, ci) => (
                        <div
                          key={ci}
                          className="h-10 rounded-sm flex flex-col items-center justify-center text-[10px]"
                          style={{
                            backgroundColor: intensityColor(
                              cell.count,
                              monthMax
                            ),
                          }}
                          title={
                            cell.dateStr
                              ? `${cell.dateStr}: ${cell.count} birras`
                              : ""
                          }
                        >
                          {cell.day !== null && (
                            <>
                              <div className="leading-none">{cell.day}</div>
                              <div className="leading-none">
                                {cell.count > 0 ? `${cell.count} birras` : ""}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <HeatmapCard data={data} />

        <Card>
          <CardHeader>
            <CardTitle>Time Range Distribution</CardTitle>
            <CardDescription>Share of beers by time range</CardDescription>
          </CardHeader>
          <CardContent>
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
  );
}
