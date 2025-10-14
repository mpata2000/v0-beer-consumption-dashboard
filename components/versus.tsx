"use client";

import { DashboardData } from "@/lib/types";
import { Select } from "@/components/ui/select";
import { PlayerComparisonTable } from "@/components/ui/player-comparison-table";
import { useState, useMemo, useEffect } from "react";
import {
  aggregateBeersPerMonthVersus,
  aggregateLitersPerMonthVersus,
  aggregateByBrandVersus,
  aggregateByVarietyVersus,
  aggregateByLocationVersus,
  aggregateByEventVersus,
} from "@/lib/versus-utils";

interface VersusProps {
  data: DashboardData | null;
}

export function Versus({ data }: VersusProps) {
  const [player1Email, setPlayer1Email] = useState<string>("");
  const [player2Email, setPlayer2Email] = useState<string>("");

  // Get list of players
  const players = useMemo(() => {
    if (!data?.playersStats) return [];
    return Object.entries(data.playersStats).map(([email, stats]) => ({
      email,
      name: stats.alias || email.split("@")[0],
    }));
  }, [data]);

  // Set default players if not selected (avoid state updates during render)
  useEffect(() => {
    if (players.length > 0 && !player1Email) setPlayer1Email(players[0].email)
    if (players.length > 1 && !player2Email) setPlayer2Email(players[1].email)
  }, [players, player1Email, player2Email])

  // Get player names
  const player1Name = useMemo(() => {
    const player = players.find((p) => p.email === player1Email);
    return player?.name || "";
  }, [players, player1Email]);

  const player2Name = useMemo(() => {
    const player = players.find((p) => p.email === player2Email);
    return player?.name || "";
  }, [players, player2Email]);

  // Aggregate data for comparisons
  const beersByMonth = useMemo(
    () => aggregateBeersPerMonthVersus(data, player1Email, player2Email),
    [data, player1Email, player2Email]
  );

  const litersByMonth = useMemo(
    () => aggregateLitersPerMonthVersus(data, player1Email, player2Email),
    [data, player1Email, player2Email]
  );

  const beersByBrand = useMemo(
    () => aggregateByBrandVersus(data, player1Email, player2Email),
    [data, player1Email, player2Email]
  );

  const beersByVariety = useMemo(
    () => aggregateByVarietyVersus(data, player1Email, player2Email),
    [data, player1Email, player2Email]
  );

  const beersByLocation = useMemo(
    () => aggregateByLocationVersus(data, player1Email, player2Email),
    [data, player1Email, player2Email]
  );

  const beersByEvent = useMemo(
    () => aggregateByEventVersus(data, player1Email, player2Email),
    [data, player1Email, player2Email]
  );

  if (players.length < 2) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">
          Se necesitan al menos 2 jugadores para hacer comparaciones.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Player Selection */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        <div className="flex items-center gap-2">
          <Select
            id="player1-select"
            value={player1Email}
            onChange={(e) => setPlayer1Email(e.target.value)}
            className="w-[150px]"
            aria-label="Seleccionar jugador 1"
          >
            <>
              {players.map((player) => (
                <option key={player.email} value={player.email}>
                  {player.name}
                </option>
              ))}
            </>
          </Select>
        </div>

        <div className="text-2xl font-bold text-muted-foreground">VS</div>

        <div className="flex items-center gap-2">
          <Select
            id="player2-select"
            value={player2Email}
            onChange={(e) => setPlayer2Email(e.target.value)}
            className="w-[150px]"
            aria-label="Seleccionar jugador 2"
          >
            <>
              {players.map((player) => (
                <option key={player.email} value={player.email}>
                  {player.name}
                </option>
              ))}
            </>
          </Select>
        </div>
      </div>

      {/* Comparison Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        <PlayerComparisonTable
          title="Birras por Mes"
          description="Cantidad de birras consumidas por mes"
          player1Name={player1Name}
          player2Name={player2Name}
          rows={beersByMonth}
          decimalPlaces={0}
        />

        <PlayerComparisonTable
          title="Litros por Mes"
          description="Cantidad de litros consumidos por mes"
          player1Name={player1Name}
          player2Name={player2Name}
          rows={litersByMonth}
          decimalPlaces={2}
        />

        <PlayerComparisonTable
          title="Marcas de Birra"
          description="Birras consumidas por marca"
          player1Name={player1Name}
          player2Name={player2Name}
          rows={beersByBrand}
          decimalPlaces={0}
          showTotal={false}
        />

        <PlayerComparisonTable
          title="Variedades de Birra"
          description="Birras consumidas por variedad"
          player1Name={player1Name}
          player2Name={player2Name}
          rows={beersByVariety}
          decimalPlaces={0}
          showTotal={false}
        />

        <PlayerComparisonTable
          title="Locaciones"
          description="Birras consumidas por locación"
          player1Name={player1Name}
          player2Name={player2Name}
          rows={beersByLocation}
          decimalPlaces={0}
          showTotal={false}
        />

        <PlayerComparisonTable
          title="Eventos"
          description="Birras consumidas por evento"
          player1Name={player1Name}
          player2Name={player2Name}
          rows={beersByEvent}
          decimalPlaces={0}
          showTotal={false}
        />
      </div>
    </div>
  );
}
