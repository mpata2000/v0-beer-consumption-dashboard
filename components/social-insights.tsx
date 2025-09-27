"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import * as RechartsPrimitive from "recharts"
import { Badge } from "@/components/ui/badge"

interface SocialInsightsProps {
  data: any
}

export function SocialInsights({ data }: SocialInsightsProps) {
  const entries = data?.entries || []

  // Calculate drinking alone statistics
  const aloneCounts = entries.reduce((acc: any, entry: any) => {
    const alone = entry.alone === "Sí" ? "Alone" : entry.alone === "No" ? "With Others" : "Unknown"
    acc[alone] = (acc[alone] || 0) + 1
    return acc
  }, {})

  const aloneData = Object.entries(aloneCounts).map(([name, value], index) => ({
    name,
    value: value as number,
    fill: `var(--chart-${(index % 5) + 1})`,
  }))

  // Calculate who drinks alone most frequently
  const memberAloneStats = entries.reduce((acc: any, entry: any) => {
    const member = entry.name
    if (!acc[member]) {
      acc[member] = { alone: 0, total: 0 }
    }
    acc[member].total += 1
    if (entry.alone === "Sí") {
      acc[member].alone += 1
    }
    return acc
  }, {})

  const aloneLeaderboard = Object.entries(memberAloneStats)
    .map(([member, stats]: [string, any]) => ({
      member,
      aloneCount: stats.alone,
      totalCount: stats.total,
      percentage: Math.round((stats.alone / stats.total) * 100),
    }))
    .filter((member) => member.aloneCount > 0)
    .sort((a, b) => b.aloneCount - a.aloneCount)
    .slice(0, 5)

  // Calculate location distribution
  const locationCounts = entries.reduce((acc: any, entry: any) => {
    const location = entry.location || "Unknown"
    acc[location] = (acc[location] || 0) + 1
    return acc
  }, {})

  const locationData = Object.entries(locationCounts)
    .map(([name, value], index) => ({
      name,
      value: value as number,
      fill: `var(--chart-${(index % 5) + 1})`,
    }))
    .sort((a, b) => b.value - a.value)

  // Calculate event distribution
  const eventCounts = entries.reduce((acc: any, entry: any) => {
    const event = entry.event || "Unknown"
    acc[event] = (acc[event] || 0) + 1
    return acc
  }, {})

  const eventData = Object.entries(eventCounts)
    .map(([name, value], index) => ({
      name,
      value: value as number,
      fill: `var(--chart-${(index % 5) + 1})`,
    }))
    .sort((a, b) => b.value - a.value)

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Drinking Alone</CardTitle>
            <CardDescription>Solo vs social drinking patterns</CardDescription>
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
                    <RechartsPrimitive.Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </RechartsPrimitive.Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </RechartsPrimitive.PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Solo Drinking Leaderboard</CardTitle>
            <CardDescription>Members who drink alone most frequently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aloneLeaderboard.map((member, index) => (
                <div key={member.member} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <span className="font-medium text-sm">{member.member}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{member.aloneCount}</div>
                    <div className="text-xs text-muted-foreground">{member.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Locations</CardTitle>
            <CardDescription>Where beers are consumed</CardDescription>
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
                  data={locationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {locationData.map((entry, index) => (
                    <RechartsPrimitive.Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </RechartsPrimitive.Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </RechartsPrimitive.PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
            <CardDescription>Occasions for beer consumption</CardDescription>
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
                  data={eventData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {eventData.map((entry, index) => (
                    <RechartsPrimitive.Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </RechartsPrimitive.Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </RechartsPrimitive.PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
