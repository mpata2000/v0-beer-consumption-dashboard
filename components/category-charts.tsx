"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import * as RechartsPrimitive from "recharts"
import { DashboardData } from "@/lib/types"
import { getGlobalBeerLocations, getGlobalBeerEvents, getGlobalAloneCount, calculateTotalStats } from "@/lib/data-utils"

interface CategoryChartsProps {
  data: DashboardData | null
}

export function CategoryCharts({ data }: CategoryChartsProps) {
  const locationCounts = getGlobalBeerLocations(data)
  const eventCounts = getGlobalBeerEvents(data)
  const aloneCount = getGlobalAloneCount(data)
  const totalBeers = calculateTotalStats(data).totalBeers

  // Expanded color palette
  const colors = [
    "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
    "hsl(var(--chart-4))", "hsl(var(--chart-5))",
    "#8b5cf6", "#ec4899", "#f97316", "#14b8a6", "#6366f1"
  ]

  const aloneData = [
    { name: "Alone", value: aloneCount, fill: colors[0] },
    { name: "With Others", value: Math.max(totalBeers - aloneCount, 0), fill: colors[1] },
  ]

  const locationData = Object.entries(locationCounts)
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)

  const eventData = Object.entries(eventCounts)
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
              className="h-[250px]"
            >
              <RechartsPrimitive.PieChart>
                <RechartsPrimitive.Pie
                  data={aloneData}
                  cx="50%"
                  cy="45%"
                  innerRadius={35}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ percent }: any) => `${(percent * 100).toFixed(0)}%`}
                >
                  {aloneData.map((entry, index) => (
                    <RechartsPrimitive.Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </RechartsPrimitive.Pie>
                <ChartTooltip content={ChartTooltipContent} />
                <RechartsPrimitive.Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px' }}
                />
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
            className="h-[250px]"
          >
            <RechartsPrimitive.PieChart>
              <RechartsPrimitive.Pie
                data={aloneData}
                cx="50%"
                cy="45%"
                innerRadius={35}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                label={({ percent }: any) => `${(percent * 100).toFixed(0)}%`}
              >
                {aloneData.map((entry, index) => (
                  <RechartsPrimitive.Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </RechartsPrimitive.Pie>
              <ChartTooltip content={ChartTooltipContent} />
              <RechartsPrimitive.Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '11px' }}
              />
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
              <ChartTooltip content={ChartTooltipContent} />
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
              <ChartTooltip content={ChartTooltipContent} />
              <RechartsPrimitive.Bar dataKey="value" fill="var(--chart-5)" radius={[2, 2, 0, 0]} />
            </RechartsPrimitive.BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
