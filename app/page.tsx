"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BeerIcon, CalendarIcon, RefreshCwIcon, ExternalLinkIcon, BarChartIcon, PieChartIcon } from "lucide-react"
import { StatsOverview } from "@/components/stats-overview"
import { Leaderboard } from "@/components/leaderboard"
import { DailyMetrics } from "@/components/daily-metrics"
import { LitersMetrics } from "@/components/liters-metrics"
import { BeerInsights } from "@/components/beer-insights"
import { SocialInsights } from "@/components/social-insights"
import { CategoryCharts } from "@/components/category-charts"

export default function BeerDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/sheets", {
        method: "GET",
      })

      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <BeerIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Birras</h1>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-accent/20 text-accent">
                <CalendarIcon className="mr-1 h-3 w-3" />
                Since Feb 2025
              </Badge>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://forms.gle/yNnGcQaCy98FGSQp9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1"
                >
                  <span>Add Entry</span>
                  <ExternalLinkIcon className="h-3 w-3" />
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
                {loading ? <RefreshCwIcon className="h-4 w-4 animate-spin" /> : <RefreshCwIcon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-2">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BeerIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="daily-metrics" className="flex items-center gap-2">
              <BarChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Daily Metrics</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <StatsOverview data={data} />
            <Leaderboard data={data} />
          </TabsContent>

          <TabsContent value="daily-metrics" className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Daily Beer Consumption Metrics</h2>
              <DailyMetrics data={data} />
            </div>
            
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Daily Liter Consumption Metrics</h2>
              <LitersMetrics data={data} />
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Beer Analysis</h2>
              <BeerInsights data={data} />
            </div>
            
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Social & Location Insights</h2>
              <SocialInsights data={data} />
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Category Analysis</h2>
              <CategoryCharts data={data} />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
