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
  topBeerDays: PeakDayRecord[];
  topLiterDays: PeakDayRecord[];
}

export function RecordsCard({
  title,
  topBeerDays,
  topLiterDays,
}: RecordsCardProps) {
  const hasData = topBeerDays.length > 0 || topLiterDays.length > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="space-y-4">
            {topBeerDays.length > 0 && (
              <RecordList
                title="Birras"
                records={topBeerDays.map((r) => ({
                  value: (r.count ?? 0).toString(),
                  label: r.displayDate,
                }))}
              />
            )}
            {topLiterDays.length > 0 && (
              <div className={topBeerDays.length > 0 ? "pt-4 border-t border-border" : ""}>
                <RecordList
                  title="Litros"
                  records={topLiterDays.map((r) => ({
                    value: `${(r.liters ?? 0).toFixed(1)}L`,
                    label: r.displayDate,
                  }))}
                />
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
        )}
      </CardContent>
    </Card>
  );
}
