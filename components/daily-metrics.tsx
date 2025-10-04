"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart } from "@mui/x-charts/LineChart"
import { BarChart } from "@mui/x-charts/BarChart"
import { ChartsAxisHighlight } from "@mui/x-charts/ChartsAxisHighlight"
import { ChartsTooltip } from "@mui/x-charts/ChartsTooltip"
import { DashboardData } from "@/lib/types"
import { getGlobalBeerPerDay } from "@/lib/data-utils"

interface DailyMetricsProps {
  data: DashboardData | null
}

export function DailyMetrics({ data }: DailyMetricsProps) {
  const perDay: Record<string, number> = getGlobalBeerPerDay(data)
  const chartDates = Object.keys(perDay).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  let cumulative = 0
  const chartData = chartDates.map((dateStr) => {
    const daily = perDay[dateStr] || 0
    cumulative += daily
    return {
      date: new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      cumulative,
      daily,
    }
  })

  // Find top global peak days (up to 3 records with top 2 unique values)
  const topGlobalDays = (() => {
    const dailyRecords = Object.entries(perDay)
      .map(([date, count]) => ({
        date,
        count: count as number,
        displayDate: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      }))
      .sort((a, b) => {
        // Sort by count descending, then by date ascending
        if (b.count !== a.count) return b.count - a.count
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })

    if (dailyRecords.length === 0) return []

    // Get unique top 2 values
    const uniqueValues = [...new Set(dailyRecords.map(r => r.count))].slice(0, 2)

    // Get all records with those top values, limit to 3 total
    return dailyRecords
      .filter(r => uniqueValues.includes(r.count))
      .slice(0, 3)
  })()

  // Find top individual records (up to 3 records with top 2 unique values)
  const topIndividualRecords = (() : Array<{ name: string; beers: number; displayDate: string; date: string }> => {
    if (!data?.entries) return []

    // Group by person and date
    const personDayTotals = new Map<string, { beers: number; date: string; name: string }>()
    data.entries.forEach(entry => {
      const key = `${entry.email}-${entry.date}`
      const existing = personDayTotals.get(key)
      if (existing) {
        existing.beers += 1
      } else {
        personDayTotals.set(key, {
          beers: 1,
          date: entry.date,
          name: entry.name,
        })
      }
    })

    // Convert to array and sort
    const records = Array.from(personDayTotals.values())
      .map(value => ({
        name: value.name,
        beers: value.beers,
        date: value.date,
        displayDate: new Date(value.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      }))
      .sort((a, b) => {
        // Sort by beers descending, then by date ascending
        if (b.beers !== a.beers) return b.beers - a.beers
        return new Date(a.date).getTime() - new Date(b.date).getTime()
      })

    if (records.length === 0) return []

    // Get unique top 2 values
    const uniqueValues = [...new Set(records.map(r => r.beers))].slice(0, 2)

    // Get all records with those top values, limit to 3 total
    return records
      .filter(r => uniqueValues.includes(r.beers))
      .slice(0, 3)
  })()


  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Peak Day</CardTitle>
            <CardDescription>Most beers consumed in one day</CardDescription>
          </CardHeader>
          <CardContent>
            {topGlobalDays.length > 0 ? (
              <div className="space-y-1">
                <div>
                  <div className="text-2xl font-bold">{topGlobalDays[0].count}</div>
                  <p className="text-xs text-muted-foreground">{topGlobalDays[0].displayDate}</p>
                </div>
                {topGlobalDays.slice(1).map((record, idx) => (
                  <div key={idx} className="pt-1 border-t border-border/50">
                    <div className={idx === 0 ? "text-lg font-semibold text-muted-foreground" : "text-sm font-medium text-muted-foreground"}>{record.count}</div>
                    <p className="text-xs text-muted-foreground">{record.displayDate}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No data</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Individual Record</CardTitle>
            <CardDescription>Most beers by one person in a day</CardDescription>
          </CardHeader>
          <CardContent>
            {topIndividualRecords.length > 0 ? (
              <div className="space-y-1">
                <div>
                  <div className="text-2xl font-bold">{topIndividualRecords[0].beers}</div>
                  <p className="text-xs text-muted-foreground">
                    {topIndividualRecords[0].name} on {topIndividualRecords[0].displayDate}
                  </p>
                </div>
                {topIndividualRecords.slice(1).map((record, idx) => (
                  <div key={idx} className="pt-1 border-t border-border/50">
                    <div className={idx === 0 ? "text-lg font-semibold text-muted-foreground" : "text-sm font-medium text-muted-foreground"}>{record.beers}</div>
                    <p className="text-xs text-muted-foreground">
                      {record.name} on {record.displayDate}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No data</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Beer Consumption</CardTitle>
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
                  scaleType: 'linear'
                },
                {
                  id: 'daily',
                  scaleType: 'linear'
                }
              ]}
              series={[
                {
                  dataKey: 'cumulative',
                  label: 'Cumulative Beers',
                  color: 'hsl(var(--chart-1))',
                  showMark: true,
                  curve: 'linear'
                },
                {
                  dataKey: 'daily',
                  label: 'Daily Beers',
                  color: 'hsl(var(--chart-2))',
                  type: 'bar' as any,
                  showMark: false
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
