"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import * as RechartsPrimitive from "recharts"
import { Badge } from "@/components/ui/badge"
import { DashboardData } from "@/lib/types"
import { getGlobalBeerBrands, getGlobalBeerTypes } from "@/lib/data-utils"

interface BeerInsightsProps {
  data: DashboardData | null
}

export function BeerInsights({ data }: BeerInsightsProps) {
  const globalBrands: Record<string, number> = getGlobalBeerBrands(data)
  const globalTypes: Record<string, number> = getGlobalBeerTypes(data)

  // Expanded color palette for more variety
  const colors = [
    "hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))",
    "hsl(var(--chart-4))", "hsl(var(--chart-5))",
    "#8b5cf6", "#ec4899", "#f97316", "#14b8a6", "#6366f1",
    "#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#84cc16"
  ]

  const brandData = Object.entries(globalBrands)
    .map(([name, value], index) => ({
      name,
      value: value as number,
      fill: colors[index % colors.length],
    }))
    .sort((a, b) => b.value - a.value)

  // Calculate variety distribution
  const varietyData = Object.entries(globalTypes)
    .map(([name, value], index) => ({
      name,
      value: value as number,
      fill: colors[index % colors.length],
    }))
    .sort((a, b) => b.value - a.value)

  // Calculate top 3 brands per member using playersStats
  const playersStats: Record<string, any> = data?.playersStats || {}
  const memberTopBrands = Object.entries(playersStats)
    .map(([member, brands]: [string, any]) => {
      const brandList = Object.entries(brands.beerBrands || {})
        .map(([brand, count]) => ({ brand, count: count as number }))
        .sort((a, b) => b.count - a.count)

      return {
        member: brands.alias || member.split("@")[0],
        brands: brandList,
        uniqueBrands: brandList.length,
      }
    })
    .filter((member) => member.uniqueBrands >= 3)
    .map((member) => ({
      ...member,
      topThree: member.brands.slice(0, 3),
    }))

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Beer Brands</CardTitle>
            <CardDescription>Distribution of beer brands consumed</CardDescription>
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
                  data={brandData}
                  cx="50%"
                  cy="45%"
                  innerRadius={40}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }}
                >
                  {brandData.map((entry, index) => (
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
            <CardTitle>Beer Varieties</CardTitle>
            <CardDescription>Types of beer consumed</CardDescription>
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
                  data={varietyData}
                  cx="50%"
                  cy="45%"
                  innerRadius={40}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }}
                >
                  {varietyData.map((entry, index) => (
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

      {memberTopBrands.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Beer Brands by Member</CardTitle>
            <CardDescription>Members with at least 3 different brands and their top choices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {memberTopBrands.map((member) => (
                <div key={member.member} className="space-y-2">
                  <h4 className="font-semibold text-sm">{member.member}</h4>
                  <div className="space-y-1">
                    {member.topThree.map((brand, index) => (
                      <div key={brand.brand} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {index + 1}. {brand.brand}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {brand.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{member.uniqueBrands} unique brands total</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
