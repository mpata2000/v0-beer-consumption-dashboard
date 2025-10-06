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
import { useMemo, useState, useRef, useEffect } from "react";
import * as d3 from "d3";

interface HeatmapCardProps {
  data: DashboardData | null;
}

type HeatmapData = {
  x: string;
  y: string;
  value: number;
};

type InteractionData = {
  xLabel: string;
  yLabel: string;
  xPos: number;
  yPos: number;
  value: number;
};

function intensityColor(value: number, maxValue: number): string {
  if (!maxValue || value <= 0) return "rgba(59,130,246,0.08)" // faint
  const t = Math.min(1, value / maxValue)
  // blue scale from light to strong
  const alpha = 0.25 + 0.55 * t
  return `rgba(59,130,246,${alpha})`
}

export function BeerTimeRangeDayOfTheWeekHeatmap({ data }: HeatmapCardProps) {
  const entries = data?.entries || [];

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  function getIsoDayIndex(dateStr: string): number {
    const d = parseIsoDateToUTC(dateStr)
    const js = d.getUTCDay() // 0=Sun..6=Sat
    return (js + 6) % 7 // 0=Mon..6=Sun
  }

  const timeRanges = useMemo(() => {
    const set = new Set<string>()
    for (const e of entries) {
      if (e.timeRange) set.add(e.timeRange)
    }
    const list = Array.from(set)
    // Try to sort by numeric start hour if present
    list.sort((a, b) => {
      const pa = parseInt(a.trim().split(/[^0-9]+/)[0] || "0", 10)
      const pb = parseInt(b.trim().split(/[^0-9]+/)[0] || "0", 10)
      return pa - pb
    })
    return list
  }, [entries])

  const heatmapCounts = useMemo(() => {
    const matrix: number[][] = Array.from({ length: dayLabels.length }, () => Array.from({ length: timeRanges.length }, () => 0))
    for (const e of entries) {
      if (!e.date || !e.timeRange) continue
      const di = getIsoDayIndex(e.date)
      const ti = timeRanges.indexOf(e.timeRange)
      if (di >= 0 && ti >= 0) matrix[di][ti] += 1
    }
    return matrix
  }, [entries, timeRanges])

  const heatmapMax = useMemo(() => {
    let max = 0
    for (const row of heatmapCounts) {
      for (const v of row) if (v > max) max = v
    }
    return max
  }, [heatmapCounts])

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle>Dia de la semana × Rango horario</CardTitle>
        <CardDescription>Cantidad de birras por dia y rango horario</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
      {timeRanges.length === 0 ? (
              <div className="text-sm text-muted-foreground">No time range data</div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-0">
                  <div className="grid gap-0.5 sm:gap-1" style={{ gridTemplateColumns: `60px repeat(${timeRanges.length}, minmax(40px, 1fr))` }}>
                    <div />
                    {timeRanges.map((tr) => (
                      <div key={tr} className="text-[10px] sm:text-xs text-center text-muted-foreground py-1 break-words">{tr}</div>
                    ))}
                    {dayLabels.map((day, di) => (
                      <>
                        <div key={`label-${day}`} className="text-[10px] sm:text-xs text-muted-foreground py-1 flex items-center">{day}</div>
                        {timeRanges.map((tr, ti) => (
                          <div
                            key={`${day}-${tr}`}
                            className="h-6 sm:h-8 rounded-sm flex items-center justify-center text-[9px] sm:text-[10px] font-medium"
                            style={{ backgroundColor: intensityColor(heatmapCounts[di][ti], heatmapMax) }}
                            title={`${day} @ ${tr}: ${heatmapCounts[di][ti]}`}
                          >
                            {heatmapCounts[di][ti] || ""}
                          </div>
                        ))}
                      </>
                    ))}
                  </div>
                </div>
              </div>
            )}
      </CardContent>
    </Card>
  );
}
