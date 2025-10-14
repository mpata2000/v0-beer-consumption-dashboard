"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardData } from "@/lib/types";
import { parseIsoDateToUTC } from "@/lib/utils";
import { TIME_RANGES } from "@/lib/constants";
import { useMemo } from "react";

interface HeatmapCardProps {
  data: DashboardData | null;
  selectedMember: string;
}

function intensityColor(value: number, maxValue: number): string {
  if (!maxValue || value <= 0) return "rgba(59,130,246,0.08)"; // faint
  const t = Math.min(1, value / maxValue);
  // blue scale from light to strong
  const alpha = 0.25 + 0.55 * t;
  return `rgba(59,130,246,${alpha})`;
}

export function BeerTimeRangeDayOfTheWeekHeatmap({ data, selectedMember }: HeatmapCardProps) {
  const entries = data?.entries || [];

  // Get member name for subtitle
  const memberName = useMemo(() => {
    if (selectedMember === "all") return "Todos";
    const stats = data?.playersStats[selectedMember];
    return stats ? (stats as any).alias || selectedMember.split("@")[0] : "Todos";
  }, [selectedMember, data]);

  const dayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  function getIsoDayIndex(dateStr: string): number {
    const d = parseIsoDateToUTC(dateStr);
    const js = d.getUTCDay(); // 0=Sun..6=Sat
    return (js + 6) % 7; // 0=Mon..6=Sun
  }

  const heatmapCounts = useMemo(() => {
    const matrix: number[][] = Array.from({ length: dayLabels.length }, () =>
      Array.from({ length: TIME_RANGES.length }, () => 0)
    );
    for (const e of entries) {
      if (!e.date || !e.timeRange) continue;
      const di = getIsoDayIndex(e.date);
      const ti = (TIME_RANGES as readonly string[]).indexOf(e.timeRange);
      if (di >= 0 && ti >= 0) matrix[di][ti] += 1;
    }
    return matrix;
  }, [entries]);

  const heatmapMax = useMemo(() => {
    let max = 0;
    for (const row of heatmapCounts) {
      for (const v of row) if (v > max) max = v;
    }
    return max;
  }, [heatmapCounts]);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle>Día de la semana × Rango horario</CardTitle>
        <CardDescription>
          Cantidad de birras de {memberName} por día y rango horario
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="min-w-0">
          <div
            className="grid gap-0.5 sm:gap-1"
            style={{
              gridTemplateColumns: `40px repeat(${TIME_RANGES.length}, minmax(40px, 1fr))`,
            }}
          >
            <div />
            {TIME_RANGES.map((tr) => (
              <div
                key={tr}
                className="text-[10px] sm:text-xs text-center text-muted-foreground py-1 break-words"
              >
                {tr}
              </div>
            ))}
            {dayLabels.map((day, di) => (
              <div key={`row-${day}`} className="contents">
                <div
                  className="text-[10px] sm:text-xs text-muted-foreground h-6 sm:h-8 flex items-center"
                >
                  {day}
                </div>
                {TIME_RANGES.map((tr, ti) => (
                  <div
                    key={`${day}-${tr}`}
                    className="h-6 sm:h-8 rounded-sm flex items-center justify-center text-[9px] sm:text-[10px] font-medium"
                    style={{
                      backgroundColor: intensityColor(
                        heatmapCounts[di][ti],
                        heatmapMax
                      ),
                    }}
                    title={`${day} @ ${tr}: ${heatmapCounts[di][ti]}`}
                  >
                    {heatmapCounts[di][ti] || ""}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
