"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart } from "@mui/x-charts/LineChart"
import { DashboardData } from "@/lib/types"
import { getGlobalMilliLitersPerDay } from "@/lib/data-utils"

interface LitersMetricsProps {
  data: DashboardData | null
}

export function LitersMetrics({ data }: LitersMetricsProps) {
  const perDay: Record<string, number> = getGlobalMilliLitersPerDay(data)
  const chartDates = Object.keys(perDay).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  let cumulative = 0
  const chartData = chartDates.map((dateStr) => {
    const dailyMl = perDay[dateStr] || 0
    const daily = dailyMl / 1000
    cumulative += daily
    return {
      date: new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      cumulative,
      daily,
    }
  })

  // Find top global peak days for liters (up to 3 records with top 2 unique values)
  const topGlobalDays = (() => {
    const dailyRecords = Object.entries(perDay)
      .map(([date, ml]) => ({
        date,
        liters: (ml as number) / 1000,
        displayDate: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      }))
      .sort((a, b) => {
        // Sort by liters descending, then by date ascending
        if (b.liters !== a.liters) return b.liters - a.liters
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })

    if (dailyRecords.length === 0) return []

    // Get unique top 2 values
    const uniqueValues = [...new Set(dailyRecords.map(r => r.liters))].slice(0, 2)

    // Get all records with those top values, limit to 3 total
    return dailyRecords
      .filter(r => uniqueValues.includes(r.liters))
      .slice(0, 3)
  })()

  // Find top individual records for liters (up to 3 records with top 2 unique values)
  const topIndividualRecords = (() : Array<{ name: string; liters: number; displayDate: string; date: string }> => {
    if (!data?.entries) return []

    // Group by person and date
    const personDayTotals = new Map<string, { liters: number; date: string; name: string }>()
    data.entries.forEach(entry => {
      const key = `${entry.email}-${entry.date}`
      const existing = personDayTotals.get(key)
      if (existing) {
        existing.liters += entry.amount / 1000
      } else {
        personDayTotals.set(key, {
          liters: entry.amount / 1000,
          date: entry.date,
          name: entry.name,
        })
      }
    })

    // Convert to array and sort
    const records = Array.from(personDayTotals.values())
      .map(value => ({
        name: value.name,
        liters: value.liters,
        date: value.date,
        displayDate: new Date(value.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      }))
      .sort((a, b) => {
        // Sort by liters descending, then by date ascending
        if (b.liters !== a.liters) return b.liters - a.liters
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })

    if (records.length === 0) return []

    // Get unique top 2 values
    const uniqueValues = [...new Set(records.map(r => r.liters))].slice(0, 2)

    // Get all records with those top values, limit to 3 total
    return records
      .filter(r => uniqueValues.includes(r.liters))
      .slice(0, 3)
  })()

  // Transform progression data for chart


  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Peak Day (Liters)</CardTitle>
            <CardDescription>Most liters consumed in one day</CardDescription>
          </CardHeader>
          <CardContent>
            {topGlobalDays.length > 0 ? (
              <div className="space-y-1">
                <div>
                  <div className="text-2xl font-bold">{topGlobalDays[0].liters.toFixed(1)}L</div>
                  <p className="text-xs text-muted-foreground">{topGlobalDays[0].displayDate}</p>
                </div>
                {topGlobalDays.slice(1).map((record, idx) => (
                  <div key={idx} className="pt-1 border-t border-border/50">
                    <div className={idx === 0 ? "text-lg font-semibold text-muted-foreground" : "text-sm font-medium text-muted-foreground"}>{record.liters.toFixed(1)}L</div>
                    <p className="text-xs text-muted-foreground">{record.displayDate}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold">0.0L</div>
                <p className="text-xs text-muted-foreground">No data</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Individual Record (Liters)</CardTitle>
            <CardDescription>Most liters by one person in a day</CardDescription>
          </CardHeader>
          <CardContent>
            {topIndividualRecords.length > 0 ? (
              <div className="space-y-1">
                <div>
                  <div className="text-2xl font-bold">{topIndividualRecords[0].liters.toFixed(1)}L</div>
                  <p className="text-xs text-muted-foreground">
                    {topIndividualRecords[0].name} on {topIndividualRecords[0].displayDate}
                  </p>
                </div>
                {topIndividualRecords.slice(1).map((record, idx) => (
                  <div key={idx} className="pt-1 border-t border-border/50">
                    <div className={idx === 0 ? "text-lg font-semibold text-muted-foreground" : "text-sm font-medium text-muted-foreground"}>{record.liters.toFixed(1)}L</div>
                    <p className="text-xs text-muted-foreground">
                      {record.name} on {record.displayDate}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold">0.0L</div>
                <p className="text-xs text-muted-foreground">No data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Liters Consumption</CardTitle>
          <CardDescription>Cumulative progression over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 400 }}>
            <LineChart
              dataset={chartData}
              width={undefined}
              height={400}
              xAxis={[{
                dataKey: 'date',
                scaleType: 'point',
                tickLabelStyle: {
                  angle: -45,
                  textAnchor: 'end',
                  fontSize: 12,
                }
              }]}
              yAxis={[
                {
                  id: 'cumulative',
                  scaleType: 'linear',
                  valueFormatter: (value) => `${value.toFixed(1)}L`
                },
                {
                  id: 'daily',
                  scaleType: 'linear',
                  valueFormatter: (value) => `${value.toFixed(1)}L`
                }
              ]}
              series={[
                {
                  dataKey: 'cumulative',
                  label: 'Cumulative Liters',
                  color: 'hsl(var(--chart-3))',
                  showMark: true,
                  curve: 'linear',
                  valueFormatter: (value) => `${value?.toFixed(1)}L`
                },
                {
                  dataKey: 'daily',
                  label: 'Daily Liters',
                  color: 'hsl(var(--chart-4))',
                  type: 'bar' as any,
                  showMark: false,
                  valueFormatter: (value) => `${value?.toFixed(1)}L`
                }
              ]}
              grid={{ horizontal: true }}
              slotProps={{
                legend: {
                  direction: 'column' as any,
                  position: { vertical: 'top', horizontal: 'center' }
                }
              }}
              margin={{ top: 60, right: 30, left: 60, bottom: 80 }}
              sx={{
                width: '100%',
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
