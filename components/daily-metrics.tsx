"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import * as RechartsPrimitive from "recharts"

interface DailyMetricsProps {
  data: any
}

export function DailyMetrics({ data }: DailyMetricsProps) {
  const progressionData = data?.progressionData || []
  const entries = data?.entries || []

  // Find day with most beers consumed
  const dayWithMostBeers = progressionData.reduce(
    (max: any, day: any) => (day.beers > (max?.beers || 0) ? day : max),
    null,
  )

  // Find individual record for most beers in a single day
  const dailyUserStats = entries.reduce((acc: any, entry: any) => {
    const dateStr = entry.parsedDate.toISOString().split("T")[0]
    const key = `${dateStr}-${entry.name}`

    if (!acc[key]) {
      acc[key] = {
        date: dateStr,
        name: entry.name,
        beers: 0,
        displayDate: entry.parsedDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }
    }
    acc[key].beers += 1
    return acc
  }, {})

  const individualRecord = Object.values(dailyUserStats).reduce(
    (max: any, record: any) => (record.beers > (max?.beers || 0) ? record : max),
    null,
  )

  // Transform progression data for chart
  const chartData = progressionData.map((day: any) => ({
    date: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    cumulative: day.cumulative,
    daily: day.beers,
  }))

  // Get time range data for pie chart
  const timeRangeData = Object.entries(data?.categories?.timeRanges || {}).map(([name, value], index) => ({
    name,
    value: value as number,
    fill: `var(--chart-${(index % 5) + 1})`,
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Peak Day</CardTitle>
            <CardDescription>Most beers consumed in one day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dayWithMostBeers?.beers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dayWithMostBeers
                ? new Date(dayWithMostBeers.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })
                : "No data"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Individual Record</CardTitle>
            <CardDescription>Most beers by one person in a day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{individualRecord?.beers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {individualRecord ? `${individualRecord.name} on ${individualRecord.displayDate}` : "No data"}
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
              className="h-[120px]"
            >
              <RechartsPrimitive.PieChart>
                <RechartsPrimitive.Pie
                  data={timeRangeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {timeRangeData.map((entry, index) => (
                    <RechartsPrimitive.Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </RechartsPrimitive.Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
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
              <ChartTooltip content={<ChartTooltipContent />} />
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
