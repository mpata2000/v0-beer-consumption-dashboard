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
} from "@/components/daily";

interface DailyMetricsProps {
  data: DashboardData | null;
  hideChart?: boolean;
}

export function DailyMetrics({ data, hideChart = false }: DailyMetricsProps) {
  const model = new DashboardModel(data);
  const perDay: Record<string, number> = model.globalBeerPerDay();
  const chartDates = model.chartDates();

  // Find top global peak days (up to 3 records with top 3 unique values)
  const topGlobalDays = useMemo(() => model.topGlobalBeerDays(3, 3), [perDay]);

  // Find top individual records (up to 3 records with top 3 unique values)
  const topIndividualRecords = useMemo(
    () => model.topIndividualBeerRecords(3, 3),
    [data]
  );

  // Liters top cards data (moved from LitersMetrics)
  const perDayMl: Record<string, number> = model.globalMilliLitersPerDay();

  const litersTopGlobalDays = useMemo(
    () => model.topGlobalLiterDays(3, 3),
    [perDayMl]
  );

  const litersTopIndividualRecords = useMemo(
    () => model.topIndividualLiterRecords(3, 3),
    [data]
  );


  return (
    <div className="space-y-6">
      {/* Records Container */}
      <div className="grid gap-4 md:grid-cols-2">
        <RecordsCard
          title="Birras"
          topGlobalDays={topGlobalDays}
          topIndividualRecords={topIndividualRecords}
          unit="beers"
        />
        <RecordsCard
          title="Litros"
          topGlobalDays={litersTopGlobalDays}
          topIndividualRecords={litersTopIndividualRecords}
          unit="liters"
        />
      </div>

      <ConsumptionCard model={model} />

      <CalendarHeatmapCard model={model} />

      {/* New Section: Heatmaps and Time-range insights */}
      <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
        <div className="flex-1 min-w-0 flex">
          <HeatmapCard data={data} />
        </div>

        <div className="flex-1 min-w-0 flex">
          <TimeRangeCard data={data} />
        </div>
      </div>
    </div>
  );
}
