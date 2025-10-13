"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart } from "@mui/x-charts/LineChart";
import { DashboardModel } from "@/lib/dashboard-model";
import { DashboardData } from "@/lib/types";
import { compareIsoDatesAsc, monthKeyFromIso } from "@/lib/utils";
import { formatMonthKeyLabel } from "@/lib/data-utils";
import { useMemo, useState } from "react";

interface ConsumptionCardProps {
  model: DashboardModel;
  data: DashboardData | null;
  selectedMember: string;
}

// Define vibrant colors for better readability
const CHART_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

export function ConsumptionCard({ model, data, selectedMember }: ConsumptionCardProps) {
  const [isCumulative, setIsCumulative] = useState(false);

  const beerPerDay = model.globalBeerPerDay();
  const mlPerDay = model.globalMilliLitersPerDay();

  // Get member name for subtitle
  const memberName = useMemo(() => {
    if (selectedMember === "all") return "Todos";
    const stats = data?.playersStats[selectedMember];
    return stats ? (stats as any).alias || selectedMember.split("@")[0] : "Todos";
  }, [selectedMember, data]);

  // Calculate per-person milestones
  const milestonesByPlayer = useMemo(
    () => model.computePlayerMilestones(100, 600),
    [model]
  );

  // Create ordered arrays for the chart
  const chartData = useMemo(() => {
    const monthBeer: Record<string, number> = {};
    const monthLiters: Record<string, number> = {};

    // Aggregate beers by month
    for (const [date, beers] of Object.entries(beerPerDay)) {
      if (!date) continue;
      const mk = monthKeyFromIso(date);
      monthBeer[mk] = (monthBeer[mk] || 0) + (beers || 0);
    }

    // Aggregate liters by month (convert from ml)
    for (const [date, ml] of Object.entries(mlPerDay)) {
      if (!date) continue;
      const mk = monthKeyFromIso(date);
      monthLiters[mk] = (monthLiters[mk] || 0) + (ml || 0) / 1000;
    }

    // Get all months with data
    const dataMonthKeys = Array.from(
      new Set([...Object.keys(monthBeer), ...Object.keys(monthLiters)])
    ).filter(Boolean);

    // If no data, return empty chart
    if (dataMonthKeys.length === 0) {
      return {
        xLabels: [],
        beersData: [],
        litersData: [],
      };
    }

    // Sort to find the earliest month
    dataMonthKeys.sort((a, b) => compareIsoDatesAsc(a + "-01", b + "-01"));
    const earliestMonth = dataMonthKeys[0];

    // Get current month
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Generate all months from earliest to current
    const [startYear, startMonth] = earliestMonth.split("-").map(Number);
    const [endYear, endMonth] = currentMonth.split("-").map(Number);

    const allMonthKeys: string[] = [];
    let year = startYear;
    let month = startMonth;

    while (year < endYear || (year === endYear && month <= endMonth)) {
      allMonthKeys.push(`${year}-${String(month).padStart(2, '0')}`);
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }

    // Calculate cumulative data if needed
    let beersData = allMonthKeys.map((mk) => monthBeer[mk] || 0);
    let litersData = allMonthKeys.map((mk) => monthLiters[mk] || 0);

    if (isCumulative) {
      let beerSum = 0;
      let literSum = 0;
      beersData = beersData.map((value) => (beerSum += value));
      litersData = litersData.map((value) => (literSum += value));
    }

    return {
      xLabels: allMonthKeys.map((mk) => formatMonthKeyLabel(mk)),
      beersData,
      litersData,
    };
  }, [beerPerDay, mlPerDay, isCumulative]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Consumo</CardTitle>
            <CardDescription>Consumo de {memberName}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {isCumulative ? "Acumulativo" : "Mensual"}
            </span>
            <button
              onClick={() => setIsCumulative(!isCumulative)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isCumulative ? "bg-primary" : "bg-muted"
              }`}
              role="switch"
              aria-checked={isCumulative}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isCumulative ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ width: "100%", position: "relative" }}>
          <LineChart
            margin={{
              left: 0,
              right: 0,
              top: 20,
              bottom: 20,
            }}
            xAxis={[
              {
                data: chartData.xLabels,
                scaleType: "point",
                tickLabelStyle: {
                  fill: "white",
                },
                sx: {
                  color: "white",
                },
                valueFormatter: (value, context) =>
                    context.location === 'tick'
                      ? value.split(' ').join('\n')
                      : value,
                  label: 'Meses',
              },
            ]}
            yAxis={[
              {
                scaleType: "linear",
              },
            ]}
            series={[
              {
                data: chartData.beersData,
                label: "Birras",
                color: "#3b82f6",
                showMark: true,
                curve: "monotoneX",
              },
              {
                data: chartData.litersData,
                label: "Litros",
                color: "#10b981",
                showMark: true,
                curve: "monotoneX",
              },
            ]}
            width={undefined}
            height={420}
            grid={{ horizontal: true, vertical: false }}
            slotProps={{
              legend: {
                direction: "horizontal",
                position: {
                  vertical: "bottom",
                  horizontal: "center",
                },
                sx: {
                  fontSize: 14,
                  color: "white",
                },
              },
            }}
          />
        </div>

        {milestonesByPlayer.size > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold mb-4">🎯 Hitos de Jugadores</h3>
            <div className="space-y-4">
              {Array.from(milestonesByPlayer.entries()).map(
                ([playerName, playerMilestones], playerIdx) => (
                  <div key={playerName} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor:
                            CHART_COLORS[playerIdx % CHART_COLORS.length],
                        }}
                      />
                      <h4 className="text-sm font-semibold">{playerName}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 ml-5">
                      {playerMilestones.map((milestone, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border/50"
                        >
                          <div>
                            <div className="text-xs text-muted-foreground">
                              {milestone.displayDate}
                            </div>
                          </div>
                          <div
                            className="text-base font-bold"
                            style={{
                              color:
                                CHART_COLORS[playerIdx % CHART_COLORS.length],
                            }}
                          >
                            {milestone.milestone}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
