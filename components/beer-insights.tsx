"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import * as RechartsPrimitive from "recharts"
import { Badge } from "@/components/ui/badge"

interface BeerInsightsProps {
  data: any
}

export function BeerInsights({ data }: BeerInsightsProps) {
  const entries = data?.entries || []

  // Calculate brand distribution
  const brandCounts = entries.reduce((acc: any, entry: any) => {
    const brand = entry.brand || "Unknown"
    acc[brand] = (acc[brand] || 0) + 1
    return acc
  }, {})

  const brandData = Object.entries(brandCounts)
    .map(([name, value], index) => ({
      name,
      value: value as number,
      fill: `var(--chart-${(index % 5) + 1})`,
    }))
    .sort((a, b) => b.value - a.value)

  // Calculate variety distribution
  const varietyCounts = entries.reduce((acc: any, entry: any) => {
    const variety = entry.variety || "Unknown"
    acc[variety] = (acc[variety] || 0) + 1
    return acc
  }, {})

  const varietyData = Object.entries(varietyCounts)
    .map(([name, value], index) => ({
      name,
      value: value as number,
      fill: `var(--chart-${(index % 5) + 1})`,
    }))
    .sort((a, b) => b.value - a.value)

  // Calculate top 3 brands per member (for members with at least 3 different brands)
  const memberBrands = entries.reduce((acc: any, entry: any) => {
    const member = entry.name
    const brand = entry.brand || "Unknown"

    if (!acc[member]) {
      acc[member] = {}
    }
    acc[member][brand] = (acc[member][brand] || 0) + 1
    return acc
  }, {})

  const memberTopBrands = Object.entries(memberBrands)
    .map(([member, brands]: [string, any]) => {
      const brandList = Object.entries(brands)
        .map(([brand, count]) => ({ brand, count: count as number }))
        .sort((a, b) => b.count - a.count)

      return {
        member,
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
              className="h-[250px]"
            >
              <RechartsPrimitive.PieChart>
                <RechartsPrimitive.Pie
                  data={brandData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {brandData.map((entry, index) => (
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
              className="h-[250px]"
            >
              <RechartsPrimitive.PieChart>
                <RechartsPrimitive.Pie
                  data={varietyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {varietyData.map((entry, index) => (
                    <RechartsPrimitive.Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </RechartsPrimitive.Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
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
