"use client";

import { DashboardData } from "@/lib/types";
import { DashboardModel } from "@/lib/dashboard-model";
import { useMemo } from "react";
import {
  RecordsCard,
  ConsumptionCard,
  HeatmapCard,
  CalendarHeatmapCard,
  TimeRangeCard,
  PlayerMonthComparisonCard,
  PlayerMonthComparisonLitersCard,
} from "@/components/daily";

interface DailyMetricsProps {
  data: DashboardData | null;
  selectedMember: string;
  hideChart?: boolean;
}

export function DailyMetrics({ data, selectedMember, hideChart = false }: DailyMetricsProps) {
  // Filter data based on selected member
  const filteredData = useMemo(() => {
    if (!data || selectedMember === "all") return data;

    const filteredEntries = data.entries.filter(entry => entry.email === selectedMember);

    // Recalculate aggregates based on filtered entries
    const newBeerPerDay: Record<string, number> = {};
    const newMilliLitersPerDay: Record<string, number> = {};

    filteredEntries.forEach(entry => {
      newBeerPerDay[entry.date] = (newBeerPerDay[entry.date] || 0) + 1;
      newMilliLitersPerDay[entry.date] = (newMilliLitersPerDay[entry.date] || 0) + entry.amount;
    });

    return {
      ...data,
      entries: filteredEntries,
      globalBeerPerDay: newBeerPerDay,
      globalMilliLitersPerDay: newMilliLitersPerDay
    };
  }, [data, selectedMember]);

  const model = new DashboardModel(filteredData);
  const perDay: Record<string, number> = model.globalBeerPerDay();
  const chartDates = model.chartDates();

  // Find top global peak days (only show when "all" is selected)
  const topGlobalDays = useMemo(() => model.topGlobalBeerDays(3, 3), [perDay]);

  // Find top individual records (up to 3 records with top 3 unique values)
  const topIndividualRecords = useMemo(
    () => model.topIndividualBeerRecords(3, 3),
    [filteredData]
  );

  // Liters top cards data (moved from LitersMetrics)
  const perDayMl: Record<string, number> = model.globalMilliLitersPerDay();

  const litersTopGlobalDays = useMemo(
    () => model.topGlobalLiterDays(3, 3),
    [perDayMl]
  );

  const litersTopIndividualRecords = useMemo(
    () => model.topIndividualLiterRecords(3, 3),
    [filteredData]
  );


  return (
    <div className="space-y-6">
      {/* Records Container */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecordsCard
          title="Birras"
          topGlobalDays={selectedMember === "all" ? topGlobalDays : []}
          topIndividualRecords={topIndividualRecords}
          unit="beers"
        />
        <RecordsCard
          title="Litros"
          topGlobalDays={selectedMember === "all" ? litersTopGlobalDays : []}
          topIndividualRecords={litersTopIndividualRecords}
          unit="liters"
        />
      </div>

      <ConsumptionCard model={model} data={data} selectedMember={selectedMember} />

      <CalendarHeatmapCard model={model} data={data} selectedMember={selectedMember} />

      {/* New Section: Heatmaps and Time-range insights */}
      <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
        <div className="flex-1 min-w-0 flex">
          <HeatmapCard data={filteredData} selectedMember={selectedMember} />
        </div>

        <div className="flex-1 min-w-0 flex">
          <TimeRangeCard data={filteredData} />
        </div>
      </div>

      {/* Player-Month Comparison Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        <PlayerMonthComparisonCard data={data} />
        <PlayerMonthComparisonLitersCard data={data} />
      </div>
    </div>
  );
}
