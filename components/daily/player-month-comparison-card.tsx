"use client";

import { DashboardData } from "@/lib/types";
import { aggregateBeersPerMonthByPlayer } from "@/lib/data-utils";
import { useMemo } from "react";
import { PlayerMonthGrid } from "@/components/ui/player-month-grid";

interface PlayerMonthComparisonCardProps {
  data: DashboardData | null;
}

export function PlayerMonthComparisonCard({ data }: PlayerMonthComparisonCardProps) {
  const { playerMonthData, allMonths, playerNames } = useMemo(
    () => aggregateBeersPerMonthByPlayer(data),
    [data]
  );

  return (
    <PlayerMonthGrid
      title="Comparación de Jugadores por Mes"
      description="Cantidad de birras consumidas por jugador en cada mes"
      playerMonthData={playerMonthData}
      allMonths={allMonths}
      playerNames={playerNames}
      colorRgb="59,130,246"
      decimalPlaces={0}
      unit=" birras"
    />
  );
}
