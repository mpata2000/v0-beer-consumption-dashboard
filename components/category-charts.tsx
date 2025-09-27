"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import * as RechartsPrimitive from "recharts"

interface CategoryChartsProps {
  data: any
}

export function CategoryCharts({ data }: CategoryChartsProps) {
  const categories = data?.categories || {}

  console.log("[v0] Categories data:", categories)

  // Transform the category data into chart format
  const timeRangeData = Object.entries(categories.timeRanges || {}).map(([name, value], index) => ({
    name,
    value: value as number,
    color: `var(--chart-${(index % 5) + 1})`,
  }))

  const aloneData = Object.entries(categories.alone || {}).map(([name, value], index) => ({
    name: name === "Sí" ? "Alone" : name === "No" ? "With Others" : name,
    value: value as number,
    color: `var(--chart-${(index % 5) + 1})`,
  }))

  const locationData = Object.entries(categories.locations || {})
    .map(([name, value]) => ({
      name,
      value: value as number,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6) // Top 6 locations

  const eventData = Object.entries(categories.events || {})
    .map(([name, value]) => ({
      name,
      value: value as number,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5) // Top 5 events

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Time Range</CardTitle>
          <CardDescription>When beers are consumed</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: {
                label: "Beers",
              },
            }}
            className="h-[200px]"
          >
            <RechartsPrimitive.PieChart>
              <RechartsPrimitive.Pie
                data={timeRangeData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {timeRangeData.map((entry, index) => (
                  <RechartsPrimitive.Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </RechartsPrimitive.Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </RechartsPrimitive.PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Social Context</CardTitle>
          <CardDescription>Drinking alone vs with others</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: {
                label: "Beers",
              },
            }}
            className="h-[200px]"
          >
            <RechartsPrimitive.PieChart>
              <RechartsPrimitive.Pie
                data={aloneData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {aloneData.map((entry, index) => (
                  <RechartsPrimitive.Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </RechartsPrimitive.Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </RechartsPrimitive.PieChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Locations</CardTitle>
          <CardDescription>Where beers are consumed</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: {
                label: "Beers",
                color: "var(--chart-3)",
              },
            }}
            className="h-[200px]"
          >
            <RechartsPrimitive.BarChart data={locationData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <RechartsPrimitive.XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <RechartsPrimitive.YAxis stroke="var(--muted-foreground)" fontSize={10} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <RechartsPrimitive.Bar dataKey="value" fill="var(--chart-3)" radius={[2, 2, 0, 0]} />
            </RechartsPrimitive.BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Events</CardTitle>
          <CardDescription>Occasions for drinking</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              value: {
                label: "Beers",
                color: "var(--chart-5)",
              },
            }}
            className="h-[200px]"
          >
            <RechartsPrimitive.BarChart data={eventData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <RechartsPrimitive.CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <RechartsPrimitive.XAxis
                dataKey="name"
                stroke="var(--muted-foreground)"
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <RechartsPrimitive.YAxis stroke="var(--muted-foreground)" fontSize={10} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <RechartsPrimitive.Bar dataKey="value" fill="var(--chart-5)" radius={[2, 2, 0, 0]} />
            </RechartsPrimitive.BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
