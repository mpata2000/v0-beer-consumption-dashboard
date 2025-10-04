"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardData } from "@/lib/types"
import { getGlobalBeerBrands, getGlobalBeerTypes, calculateTotalStats } from "@/lib/data-utils"

interface BeerInsightsProps {
  data: DashboardData | null
}

export function BeerInsights({ data }: BeerInsightsProps) {
  const globalBrands: Record<string, number> = getGlobalBeerBrands(data)
  const globalTypes: Record<string, number> = getGlobalBeerTypes(data)
  const totalBeers: number = calculateTotalStats(data).totalBeers

  // Transform brands to list with percentages
  const brandList = Object.entries(globalBrands)
    .map(([name, value]) => ({
      name,
      count: value as number,
      percentage: totalBeers > 0 ? ((value as number / totalBeers) * 100).toFixed(1) : '0.0'
    }))
    .sort((a, b) => b.count - a.count)

  // Transform varieties to list with percentages
  const varietyList = Object.entries(globalTypes)
    .map(([name, value]) => ({
      name,
      count: value as number,
      percentage: totalBeers > 0 ? ((value as number / totalBeers) * 100).toFixed(1) : '0.0'
    }))
    .sort((a, b) => b.count - a.count)

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
            <CardDescription>Distribution of beer brands consumed (sorted by frequency)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {brandList.map((brand, index) => (
                <div key={brand.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Badge variant="outline" className="w-7 h-7 p-0 flex items-center justify-center text-xs flex-shrink-0">
                      {index + 1}
                    </Badge>
                    <span className="font-medium text-sm truncate">{brand.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-sm font-semibold">{brand.count}</div>
                    <div className="text-xs text-muted-foreground">{brand.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Beer Varieties</CardTitle>
            <CardDescription>Types of beer consumed (sorted by frequency)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {varietyList.map((variety, index) => (
                <div key={variety.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Badge variant="outline" className="w-7 h-7 p-0 flex items-center justify-center text-xs flex-shrink-0">
                      {index + 1}
                    </Badge>
                    <span className="font-medium text-sm truncate">{variety.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-sm font-semibold">{variety.count}</div>
                    <div className="text-xs text-muted-foreground">{variety.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
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
