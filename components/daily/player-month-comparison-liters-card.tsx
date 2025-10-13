"use client";

import { DashboardData } from "@/lib/types";
import { aggregateLitersPerMonthByPlayer } from "@/lib/data-utils";
import { useMemo } from "react";
import { PlayerMonthGrid } from "@/components/ui/player-month-grid";

interface PlayerMonthComparisonLitersCardProps {
  data: DashboardData | null;
}

export function PlayerMonthComparisonLitersCard({ data }: PlayerMonthComparisonLitersCardProps) {
  const { playerMonthData, allMonths, playerNames } = useMemo(
    () => aggregateLitersPerMonthByPlayer(data),
    [data]
  );

  return (
    <PlayerMonthGrid
      title="Comparación de Jugadores por Mes (Litros)"
      description="Cantidad de litros consumidos por jugador en cada mes"
      playerMonthData={playerMonthData}
      allMonths={allMonths}
      playerNames={playerNames}
      colorRgb="16,185,129"
      decimalPlaces={1}
      unit="L"
    />
  );
}
