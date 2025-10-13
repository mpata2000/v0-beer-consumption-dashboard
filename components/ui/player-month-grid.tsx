"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatMonthKeyLabel } from "@/lib/data-utils";
import { useMemo } from "react";

interface PlayerMonthGridProps {
  title: string;
  description: string;
  playerMonthData: Map<string, Map<string, number>>;
  allMonths: string[];
  playerNames: Map<string, string>;
  colorRgb: string; // e.g., "59,130,246" for blue or "16,185,129" for green
  decimalPlaces?: number;
  unit?: string; // e.g., "birras" or "L"
}

function intensityColor(value: number, maxValue: number, colorRgb: string): string {
  if (!maxValue || value <= 0) return `rgba(${colorRgb},0.08)`; // faint
  const t = Math.min(1, value / maxValue);
  const alpha = 0.25 + 0.55 * t;
  return `rgba(${colorRgb},${alpha})`;
}

export function PlayerMonthGrid({
  title,
  description,
  playerMonthData,
  allMonths,
  playerNames,
  colorRgb,
  decimalPlaces = 0,
  unit = "",
}: PlayerMonthGridProps) {
  // Get sorted player emails (by total descending)
  const sortedPlayers = useMemo(() => {
    const playerTotals = Array.from(playerMonthData.entries()).map(([email, monthMap]) => {
      const total = Array.from(monthMap.values()).reduce((sum, count) => sum + count, 0);
      return { email, total };
    });
    return playerTotals
      .sort((a, b) => b.total - a.total)
      .map(({ email }) => email);
  }, [playerMonthData]);

  // Calculate max value for color intensity
  const maxValue = useMemo(() => {
    let max = 0;
    for (const monthMap of playerMonthData.values()) {
      for (const count of monthMap.values()) {
        if (count > max) max = count;
      }
    }
    return max;
  }, [playerMonthData]);

  // Calculate monthly totals
  const monthlyTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const month of allMonths) {
      let sum = 0;
      for (const email of sortedPlayers) {
        const monthMap = playerMonthData.get(email);
        sum += monthMap?.get(month) || 0;
      }
      totals.set(month, sum);
    }
    return totals;
  }, [allMonths, sortedPlayers, playerMonthData]);

  // Calculate player totals
  const playerTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const email of sortedPlayers) {
      const monthMap = playerMonthData.get(email);
      const total = monthMap ? Array.from(monthMap.values()).reduce((sum, count) => sum + count, 0) : 0;
      totals.set(email, total);
    }
    return totals;
  }, [sortedPlayers, playerMonthData]);

  if (sortedPlayers.length === 0 || allMonths.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const formatValue = (value: number) => {
    if (decimalPlaces > 0) {
      return value > 0 ? value.toFixed(decimalPlaces) : "";
    }
    return value || "";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-hidden">
        <div className="overflow-x-auto">
          <div
            className="grid gap-0.5 sm:gap-1 min-w-max"
            style={{
              gridTemplateColumns: `35px repeat(${sortedPlayers.length}, 50px) 50px`,
            }}
          >
            {/* Header row */}
            <div className="text-xs font-semibold text-muted-foreground py-2" />
            {sortedPlayers.map((email) => {
              const displayName = playerNames.get(email) || email.split("@")[0];
              return (
                <div
                  key={email}
                  className="text-[10px] sm:text-xs font-semibold text-center text-muted-foreground py-2 px-1 truncate"
                  title={displayName}
                >
                  {displayName}
                </div>
              );
            })}
            <div className="text-[10px] sm:text-xs font-semibold text-center text-muted-foreground py-2">
              Total
            </div>

            {/* Data rows */}
            {allMonths.map((month) => {
              const monthLabel = formatMonthKeyLabel(month);
              return (
                <>
                  <div
                    key={`label-${month}`}
                    className="text-[10px] sm:text-xs text-muted-foreground h-8 sm:h-10 flex items-center font-medium truncate"
                    title={monthLabel}
                  >
                    {monthLabel}
                  </div>
                  {sortedPlayers.map((email) => {
                    const monthMap = playerMonthData.get(email);
                    const value = monthMap?.get(month) || 0;
                    const displayName = playerNames.get(email) || email.split("@")[0];
                    return (
                      <div
                        key={`${email}-${month}`}
                        className="h-8 sm:h-10 rounded-sm flex items-center justify-center text-[10px] sm:text-xs font-medium"
                        style={{
                          backgroundColor: intensityColor(value, maxValue, colorRgb),
                        }}
                        title={`${displayName} - ${monthLabel}: ${value.toFixed(decimalPlaces)}${unit}`}
                      >
                        {formatValue(value)}
                      </div>
                    );
                  })}
                  <div
                    key={`total-${month}`}
                    className="h-8 sm:h-10 flex items-center justify-center text-[10px] sm:text-xs font-bold bg-muted/30 rounded-sm"
                  >
                    {(monthlyTotals.get(month) || 0).toFixed(decimalPlaces)}
                  </div>
                </>
              );
            })}

            {/* Total row */}
            <div className="text-[10px] sm:text-xs text-muted-foreground h-8 sm:h-10 flex items-center font-bold border-t-2 border-border pt-1">
              Total
            </div>
            {sortedPlayers.map((email) => (
              <div
                key={`player-total-${email}`}
                className="h-8 sm:h-10 flex items-center justify-center text-[10px] sm:text-xs font-bold bg-muted/50 rounded-sm border-t-2 border-border"
              >
                {(playerTotals.get(email) || 0).toFixed(decimalPlaces)}
              </div>
            ))}
            <div className="h-8 sm:h-10 flex items-center justify-center text-[10px] sm:text-xs font-bold bg-primary/20 rounded-sm border-t-2 border-border">
              {Array.from(playerTotals.values()).reduce((sum, count) => sum + count, 0).toFixed(decimalPlaces)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
