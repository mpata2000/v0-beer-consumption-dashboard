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

interface IndividualRecord {
  date: string;
  displayDate: string;
  name: string;
  beers?: number;
  liters?: number;
}

interface RecordsCardProps {
  title: string;
  topGlobalDays: PeakDayRecord[];
  topIndividualRecords: IndividualRecord[];
  unit?: "beers" | "liters";
}

export function RecordsCard({
  title,
  topGlobalDays,
  topIndividualRecords,
  unit = "beers",
}: RecordsCardProps) {
  const formatValue = (value: number) => {
    return unit === "liters" ? `${value.toFixed(1)}L` : value.toString();
  };

  const getValue = (record: PeakDayRecord | IndividualRecord) => {
    if (unit === "liters") {
      return "liters" in record && record.liters !== undefined
        ? record.liters
        : 0;
    }
    return "count" in record && record.count !== undefined
      ? record.count
      : "beers" in record && record.beers !== undefined
      ? record.beers
      : 0;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <RecordList
            title="Grupal"
            records={topGlobalDays.map((r) => ({
              value: formatValue(getValue(r)),
              label: r.displayDate,
            }))}
          />

          <div className="pt-4 border-t border-border">
            <RecordList
              title="Individual"
              records={topIndividualRecords.map((r) => ({
                value: formatValue(getValue(r)),
                label: `${r.name} on ${r.displayDate}`,
              }))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
