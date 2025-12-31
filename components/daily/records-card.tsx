"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RecordList } from "./record-list";

interface PeakDayRecord {
  date: string;
  displayDate: string;
  count?: number;
  liters?: number;
}

interface RecordsCardProps {
  title: string;
  topGlobalDays: PeakDayRecord[];
  unit?: "beers" | "liters";
}

export function RecordsCard({
  title,
  topGlobalDays,
  unit = "beers",
}: RecordsCardProps) {
  const formatValue = (value: number) => {
    return unit === "liters" ? `${value.toFixed(1)}L` : value.toString();
  };

  const getValue = (record: PeakDayRecord) => {
    if (unit === "liters") {
      return record.liters !== undefined ? record.liters : 0;
    }
    return record.count !== undefined ? record.count : 0;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {topGlobalDays.length > 0 ? (
          <RecordList
            title="Grupal"
            records={topGlobalDays.map((r) => ({
              value: formatValue(getValue(r)),
              label: r.displayDate,
            }))}
          />
        ) : (
          <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
        )}
      </CardContent>
    </Card>
  );
}
