"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import * as RechartsPrimitive from "recharts"
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

  // Find day with most beers consumed
  const dayWithMostBeers = chartData.reduce((max: any, day: any) => (day.daily > (max?.daily || 0) ? day : max), chartData[0] || null)

  // Find individual record for most beers in a single day by one person
  const individualRecord = (() : { name: string; beers: number; displayDate: string } | null => {
    if (!data?.entries) return null

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

    // Find max
    let max: { name: string; beers: number; displayDate: string } | null = null
    personDayTotals.forEach(value => {
      if (!max || value.beers > max.beers) {
        max = {
          name: value.name,
          beers: value.beers,
          displayDate: new Date(value.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        }
      }
    })

    return max
  })()

  // Get time range data for pie chart
  const timeRangeCounts: Record<string, number> = {}
  if (data?.entries) {
    data.entries.forEach(entry => {
      const timeRange = entry.timeRange || "Unknown"
      timeRangeCounts[timeRange] = (timeRangeCounts[timeRange] || 0) + 1
    })
  }

  // Expanded color palette
  const colors = [
    "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
    "hsl(var(--chart-4))", "hsl(var(--chart-5))",
    "#8b5cf6", "#ec4899", "#f97316", "#14b8a6", "#6366f1"
  ]

  const timeRangeData = Object.entries(timeRangeCounts)
    .map(([name, value], index) => ({
      name,
      value: value as number,
      fill: colors[index % colors.length],
    }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Peak Day</CardTitle>
            <CardDescription>Most beers consumed in one day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dayWithMostBeers?.daily || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dayWithMostBeers?.date || "No data"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Individual Record</CardTitle>
            <CardDescription>Most beers by one person in a day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(individualRecord as any)?.beers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {individualRecord ? `${(individualRecord as any).name} on ${(individualRecord as any).displayDate}` : "No data"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Drinking Hours</CardTitle>
            <CardDescription>Distribution by time range</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Beers",
                },
              }}
              className="h-[180px]"
            >
              <RechartsPrimitive.PieChart>
                <RechartsPrimitive.Pie
                  data={timeRangeData}
                  cx="50%"
                  cy="40%"
                  innerRadius={25}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ percent }: any) => `${(percent * 100).toFixed(0)}%`}
                >
                  {timeRangeData.map((entry, index) => (
                    <RechartsPrimitive.Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </RechartsPrimitive.Pie>
                <ChartTooltip content={ChartTooltipContent} />
                <RechartsPrimitive.Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '10px' }}
                />
              </RechartsPrimitive.PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Beer Consumption</CardTitle>
          <CardDescription>Cumulative progression over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              cumulative: {
                label: "Cumulative Beers",
                color: "var(--chart-1)",
              },
              daily: {
                label: "Daily Beers",
                color: "var(--chart-2)",
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
              <ChartTooltip content={ChartTooltipContent} />
              <RechartsPrimitive.Line
                yAxisId="left"
                type="monotone"
                dataKey="cumulative"
                stroke="var(--chart-1)"
                strokeWidth={2}
                dot={{ fill: "var(--chart-1)", strokeWidth: 2, r: 3 }}
              />
              <RechartsPrimitive.Bar
                yAxisId="right"
                dataKey="daily"
                fill="var(--chart-2)"
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
