"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardData } from "@/lib/types";
import { aggregateBeersPerMonthByPlayer, formatMonthKeyLabel } from "@/lib/data-utils";
import { useMemo } from "react";

interface PlayerMonthComparisonCardProps {
  data: DashboardData | null;
}

function intensityColor(value: number, maxValue: number): string {
  if (!maxValue || value <= 0) return "rgba(59,130,246,0.08)"; // faint
  const t = Math.min(1, value / maxValue);
  // blue scale from light to strong
  const alpha = 0.25 + 0.55 * t;
  return `rgba(59,130,246,${alpha})`;
}

export function PlayerMonthComparisonCard({ data }: PlayerMonthComparisonCardProps) {
  const { playerMonthData, allMonths, playerNames } = useMemo(
    () => aggregateBeersPerMonthByPlayer(data),
    [data]
  );

  // Get sorted player emails (by total beers descending)
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
          <CardTitle>Comparación de Jugadores por Mes</CardTitle>
          <CardDescription>
            No hay datos disponibles
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Comparación de Jugadores por Mes</CardTitle>
        <CardDescription>
          Cantidad de birras consumidas por jugador en cada mes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div
            className="grid gap-0.5 sm:gap-1 min-w-max"
            style={{
              gridTemplateColumns: `80px repeat(${sortedPlayers.length}, minmax(80px, 1fr)) minmax(70px, auto)`,
            }}
          >
            {/* Header row */}
            <div className="text-xs font-semibold text-muted-foreground py-2" />
            {sortedPlayers.map((email) => (
              <div
                key={email}
                className="text-[10px] sm:text-xs font-semibold text-center text-muted-foreground py-2 break-words px-1"
              >
                {playerNames.get(email) || email.split("@")[0]}
              </div>
            ))}
            <div className="text-[10px] sm:text-xs font-semibold text-center text-muted-foreground py-2">
              Total
            </div>

            {/* Data rows */}
            {allMonths.map((month) => (
              <>
                <div
                  key={`label-${month}`}
                  className="text-[10px] sm:text-xs text-muted-foreground h-8 sm:h-10 flex items-center font-medium"
                >
                  {formatMonthKeyLabel(month)}
                </div>
                {sortedPlayers.map((email) => {
                  const monthMap = playerMonthData.get(email);
                  const count = monthMap?.get(month) || 0;
                  return (
                    <div
                      key={`${email}-${month}`}
                      className="h-8 sm:h-10 rounded-sm flex items-center justify-center text-[10px] sm:text-xs font-medium"
                      style={{
                        backgroundColor: intensityColor(count, maxValue),
                      }}
                      title={`${playerNames.get(email)} - ${formatMonthKeyLabel(month)}: ${count} birras`}
                    >
                      {count || ""}
                    </div>
                  );
                })}
                <div
                  key={`total-${month}`}
                  className="h-8 sm:h-10 flex items-center justify-center text-[10px] sm:text-xs font-bold bg-muted/30 rounded-sm"
                >
                  {monthlyTotals.get(month) || 0}
                </div>
              </>
            ))}

            {/* Total row */}
            <div className="text-[10px] sm:text-xs text-muted-foreground h-8 sm:h-10 flex items-center font-bold border-t-2 border-border pt-1">
              Total
            </div>
            {sortedPlayers.map((email) => (
              <div
                key={`player-total-${email}`}
                className="h-8 sm:h-10 flex items-center justify-center text-[10px] sm:text-xs font-bold bg-muted/50 rounded-sm border-t-2 border-border"
              >
                {playerTotals.get(email) || 0}
              </div>
            ))}
            <div className="h-8 sm:h-10 flex items-center justify-center text-[10px] sm:text-xs font-bold bg-primary/20 rounded-sm border-t-2 border-border">
              {Array.from(playerTotals.values()).reduce((sum, count) => sum + count, 0)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
