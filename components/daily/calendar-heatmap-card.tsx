"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardModel } from "@/lib/dashboard-model";
import { monthMetaFromKey } from "@/lib/utils";
import { useMemo, useState } from "react";

interface CalendarHeatmapCardProps {
  model: DashboardModel;
}

export function CalendarHeatmapCard({ model }: CalendarHeatmapCardProps) {
  const perDay: Record<string, number> = model.globalBeerPerDay();

  const monthKeys = useMemo(() => model.monthKeys(), [model]);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    () => monthKeys[monthKeys.length - 1] || ""
  );

  const monthDailyCounts = useMemo(
    () => (selectedMonth ? model.monthDailyCounts(selectedMonth) : {}),
    [model, selectedMonth]
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar de Birras</CardTitle>
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
          <div className="min-w-0">
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
                      className="h-8 sm:h-10 rounded-sm flex flex-col items-center justify-center text-[9px] sm:text-[10px]"
                      style={{
                        backgroundColor: cell.day !== null
                          ? intensityColor(cell.count, monthMax)
                          : undefined,
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
  );
}
