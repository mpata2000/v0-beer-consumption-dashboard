"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BeerIcon, DropletIcon } from "lucide-react"
import { DashboardData } from "@/lib/types"
import { calculateTotalStats } from "@/lib/data-utils"

interface StatsOverviewProps {
  data: DashboardData | null
}

export function StatsOverview({ data }: StatsOverviewProps) {
  const stats = calculateTotalStats(data)

  console.log("[v0] Stats data:", stats)

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/10 border-primary/20">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <BeerIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.totalBeers.toLocaleString()}</div>
              <div className="text-sm font-medium text-muted-foreground">Total Beers</div>
              <div className="text-xs text-muted-foreground">{stats.avgBeersPerDay.toFixed(2)} avg/day</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <DropletIcon className="h-6 w-6 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{stats.totalLiters}L</div>
              <div className="text-sm font-medium text-muted-foreground">Total Liters</div>
              <div className="text-xs text-muted-foreground">{stats.avgLitersPerDay.toFixed(2)}L avg/day</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
