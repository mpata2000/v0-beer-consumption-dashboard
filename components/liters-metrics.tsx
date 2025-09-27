"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import * as RechartsPrimitive from "recharts"

interface LitersMetricsProps {
  data: any
}

export function LitersMetrics({ data }: LitersMetricsProps) {
  const progressionData = data?.progressionData || []
  const entries = data?.entries || []

  // Find day with most liters consumed
  const dayWithMostLiters = progressionData.reduce(
    (max: any, day: any) => (day.liters > (max?.liters || 0) ? day : max),
    null,
  )

  // Find individual record for most liters in a single day
  const dailyUserStats = entries.reduce((acc: any, entry: any) => {
    // Ensure parsedDate is a proper Date object
    const parsedDate = new Date(entry.parsedDate)
    const dateStr = parsedDate.toISOString().split("T")[0]
    const key = `${dateStr}-${entry.name}`

    if (!acc[key]) {
      acc[key] = {
        date: dateStr,
        name: entry.name,
        liters: 0,
        displayDate: parsedDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }
    }
    acc[key].liters += entry.amount / 1000
    return acc
  }, {})

  const individualRecord = Object.values(dailyUserStats).reduce(
    (max: any, record: any) => (record.liters > (max?.liters || 0) ? record : max),
    null,
  )

  // Transform progression data for chart
  const chartData = progressionData.map((day: any) => ({
    date: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    cumulative: day.cumulativeLiters,
    daily: day.liters,
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Peak Day (Liters)</CardTitle>
            <CardDescription>Most liters consumed in one day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dayWithMostLiters?.liters?.toFixed(1) || "0.0"}L</div>
            <p className="text-xs text-muted-foreground">
              {dayWithMostLiters
                ? new Date(dayWithMostLiters.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })
                : "No data"}
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
                content={<ChartTooltipContent formatter={(value, name) => [`${Number(value).toFixed(1)}L`, name]} />}
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
