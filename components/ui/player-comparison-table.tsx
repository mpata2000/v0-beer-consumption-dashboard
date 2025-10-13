"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ComparisonRow {
  label: string;
  player1Value: number;
  player2Value: number;
}

interface PlayerComparisonTableProps {
  title: string;
  description: string;
  player1Name: string;
  player2Name: string;
  rows: ComparisonRow[];
  decimalPlaces?: number;
  showTotal?: boolean;
}

function intensityColor(value: number, isPositive: boolean): string {
  if (value === 0) return "transparent";
  // Green for positive (player1 ahead), red for negative (player2 ahead)
  const color = isPositive ? "34,197,94" : "239,68,68"; // green-500 / red-500
  const alpha = Math.min(0.7, 0.2 + Math.abs(value) * 0.05);
  return `rgba(${color},${alpha})`;
}

export function PlayerComparisonTable({
  title,
  description,
  player1Name,
  player2Name,
  rows,
  decimalPlaces = 0,
  showTotal = true,
}: PlayerComparisonTableProps) {
  if (rows.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const totals = rows.reduce(
    (acc, row) => ({
      player1: acc.player1 + row.player1Value,
      player2: acc.player2 + row.player2Value,
    }),
    { player1: 0, player2: 0 }
  );
  const totalDiff = totals.player1 - totals.player2;

  return (
    <Card className="w-full flex flex-col h-[650px]">
      <CardHeader className="flex-shrink-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 overflow-y-auto">
          <div className="min-w-max">
            {/* Header row */}
            <div className="grid grid-cols-[80px_80px_80px_80px] gap-2 mb-2 sticky top-0 bg-card z-10">
              <div className="text-xs font-semibold text-muted-foreground py-2" />
              <div className="text-xs font-semibold text-center text-muted-foreground py-2 truncate">
                {player1Name}
              </div>
              <div className="text-xs font-semibold text-center text-muted-foreground py-2 truncate">
                {player2Name}
              </div>
              <div className="text-xs font-semibold text-center text-muted-foreground py-2">
                Diff
              </div>
            </div>

            {/* Data rows */}
            <div className={showTotal ? "pb-16" : "pb-4"}>
              {rows.map((row, index) => {
                const diff = row.player1Value - row.player2Value;
                return (
                  <div
                    key={index}
                    className="grid grid-cols-[80px_80px_80px_80px] gap-2 mb-1"
                  >
                    <div
                      className="text-xs text-muted-foreground h-8 flex items-center font-medium truncate"
                      title={row.label}
                    >
                      {row.label}
                    </div>
                    <div className="h-8 rounded-sm flex items-center justify-center text-xs font-medium bg-muted/30">
                      {row.player1Value.toFixed(decimalPlaces)}
                    </div>
                    <div className="h-8 rounded-sm flex items-center justify-center text-xs font-medium bg-muted/30">
                      {row.player2Value.toFixed(decimalPlaces)}
                    </div>
                    <div
                      className="h-8 rounded-sm flex items-center justify-center text-xs font-bold"
                      style={{
                        backgroundColor: intensityColor(Math.abs(diff), diff > 0),
                      }}
                    >
                      {diff > 0 ? "+" : ""}
                      {diff.toFixed(decimalPlaces)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Total row - fixed at bottom */}
        {showTotal && (
          <div className="border-t-2 border-border pt-2 mt-2 flex-shrink-0 bg-card">
            <div className="overflow-x-auto">
              <div className="min-w-max">
                <div className="grid grid-cols-[80px_80px_80px_80px] gap-2">
                  <div className="text-xs text-muted-foreground h-8 flex items-center font-bold">
                    Total
                  </div>
                  <div className="h-8 rounded-sm flex items-center justify-center text-xs font-bold bg-muted/50">
                    {totals.player1.toFixed(decimalPlaces)}
                  </div>
                  <div className="h-8 rounded-sm flex items-center justify-center text-xs font-bold bg-muted/50">
                    {totals.player2.toFixed(decimalPlaces)}
                  </div>
                  <div
                    className="h-8 rounded-sm flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: intensityColor(Math.abs(totalDiff), totalDiff > 0),
                    }}
                  >
                    {totalDiff > 0 ? "+" : ""}
                    {totalDiff.toFixed(decimalPlaces)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
