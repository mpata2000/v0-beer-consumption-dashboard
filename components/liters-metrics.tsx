"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import * as RechartsPrimitive from "recharts"
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

  // Find day with most liters consumed
  const dayWithMostLiters = chartData.reduce((max: any, day: any) => (day.daily > (max?.daily || 0) ? day : max), chartData[0] || null)

  // Find individual record for most liters in a single day by one person
  const individualRecord: { name: string; liters: number; displayDate: string } | null = (() : { name: string; liters: number; displayDate: string } | null => {
    if (!data?.entries) return null

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

    // Find max
    let max: { name: string; liters: number; displayDate: string } | null = null
    personDayTotals.forEach(value => {
      if (!max || value.liters > max.liters) {
        max = {
          name: value.name,
          liters: value.liters,
          displayDate: new Date(value.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        }
      }
    })

    return max
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
            <div className="text-2xl font-bold">{dayWithMostLiters?.daily?.toFixed(1) || "0.0"}L</div>
            <p className="text-xs text-muted-foreground">
              {dayWithMostLiters?.date || "No data"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Individual Record (Liters)</CardTitle>
            <CardDescription>Most liters by one person in a day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{individualRecord?.liters?.toFixed(1) || "0.0"}L</div>
            <p className="text-xs text-muted-foreground">
              {individualRecord ? `${individualRecord.name} on ${individualRecord.displayDate}` : "No data"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Liters Consumption</CardTitle>
          <CardDescription>Cumulative progression over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              cumulative: {
                label: "Cumulative Liters",
                color: "var(--chart-3)",
              },
              daily: {
                label: "Daily Liters",
                color: "var(--chart-4)",
              },
            }}
            className="h-[300px]"
          >
            <RechartsPrimitive.ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <RechartsPrimitive.XAxis
                dataKey="date"
                stroke="var(--muted-foreground)"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <RechartsPrimitive.YAxis yAxisId="left" stroke="var(--muted-foreground)" fontSize={12} />
              <RechartsPrimitive.YAxis
                yAxisId="right"
                orientation="right"
                stroke="var(--muted-foreground)"
                fontSize={12}
              />
              <ChartTooltip
                content={(props) => (
                  <ChartTooltipContent
                    {...props}
                    valueFormatter={(value) => `${Number(value).toFixed(1)}L`}
                  />
                )}
              />
              <RechartsPrimitive.Line
                yAxisId="left"
                type="monotone"
                dataKey="cumulative"
                stroke="var(--chart-3)"
                strokeWidth={2}
                dot={{ fill: "var(--chart-3)", strokeWidth: 2, r: 3 }}
              />
              <RechartsPrimitive.Bar
                yAxisId="right"
                dataKey="daily"
                fill="var(--chart-4)"
                opacity={0.6}
                radius={[2, 2, 0, 0]}
              />
            </RechartsPrimitive.ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
