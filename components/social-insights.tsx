"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import * as RechartsPrimitive from "recharts"
import { Badge } from "@/components/ui/badge"
import { DashboardData } from "@/lib/types"
import { getGlobalAloneCount, calculateTotalStats, getAllPlayerEmails, getPlayerStats } from "@/lib/data-utils"

interface SocialInsightsProps {
  data: DashboardData | null
}

export function SocialInsights({ data }: SocialInsightsProps) {
  const globalBeerAlone: number = getGlobalAloneCount(data)
  const totalBeers: number = calculateTotalStats(data).totalBeers
  const aloneCounts = {
    Alone: globalBeerAlone,
    "With Others": Math.max(totalBeers - globalBeerAlone, 0),
  }

  // Expanded color palette
  const colors = [
    "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
    "hsl(var(--chart-4))", "hsl(var(--chart-5))",
    "#8b5cf6", "#ec4899", "#f97316", "#14b8a6", "#6366f1",
    "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#84cc16"
  ]

  const aloneData = Object.entries(aloneCounts).map(([name, value], index) => ({
    name,
    value: value as number,
    fill: colors[index % colors.length],
  }))

  // Calculate who drinks alone most frequently using player stats
  const emails = getAllPlayerEmails(data)
  const memberAloneStats = Object.fromEntries(
    emails.map(email => {
      const stats = getPlayerStats(data, email)
      const playerEntry = data?.entries.find(e => e.email === email)
      return [
        playerEntry?.name || email.split("@")[0],
        { alone: stats.drankAlone || 0, total: stats.totalBeers || 0 },
      ]
    })
  )

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

  // Use pre-computed location data
  const locationCounts = data?.globalBeerLocations || {}

  const locationData = Object.entries(locationCounts)
    .map(([name, value], index) => ({
      name,
      value: value as number,
      fill: colors[index % colors.length],
    }))
    .sort((a, b) => b.value - a.value)

  // Use pre-computed event data
  const eventCounts = data?.globalBeerEvents || {}

  const eventData = Object.entries(eventCounts)
    .map(([name, value], index) => ({
      name,
      value: value as number,
      fill: colors[index % colors.length],
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
              className="h-[250px]"
            >
              <RechartsPrimitive.PieChart>
                <RechartsPrimitive.Pie
                  data={aloneData}
                  cx="50%"
                  cy="45%"
                  innerRadius={40}
                  outerRadius={75}
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
                  wrapperStyle={{ fontSize: '12px' }}
                />
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
              className="h-[350px]"
            >
              <RechartsPrimitive.PieChart>
                <RechartsPrimitive.Pie
                  data={locationData}
                  cx="50%"
                  cy="45%"
                  innerRadius={40}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }}
                >
                  {locationData.map((entry, index) => (
                    <RechartsPrimitive.Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </RechartsPrimitive.Pie>
                <ChartTooltip content={ChartTooltipContent} />
                <RechartsPrimitive.Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px' }}
                />
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
              className="h-[350px]"
            >
              <RechartsPrimitive.PieChart>
                <RechartsPrimitive.Pie
                  data={eventData}
                  cx="50%"
                  cy="45%"
                  innerRadius={40}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }}
                >
                  {eventData.map((entry, index) => (
                    <RechartsPrimitive.Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </RechartsPrimitive.Pie>
                <ChartTooltip content={ChartTooltipContent} />
                <RechartsPrimitive.Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </RechartsPrimitive.PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
