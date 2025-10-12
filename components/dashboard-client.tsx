"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select } from "@/components/ui/select"
import { BeerIcon, CalendarIcon, RefreshCwIcon, ExternalLinkIcon, BarChartIcon, PieChartIcon } from "lucide-react"
import { StatsOverview } from "@/components/stats-overview"
import { Leaderboard } from "@/components/leaderboard"
import { DailyMetrics } from "@/components/daily-metrics"
import { Insights } from "@/components/insights"
import { PlayerMonthComparisonCard, PlayerMonthComparisonLitersCard } from "@/components/daily"
import { useRouter } from "next/navigation"
import { DashboardData } from "@/lib/types"

interface DashboardClientProps {
  initialData: DashboardData | null
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedMember, setSelectedMember] = useState<string>("all")

  // Get list of members for the dropdown
  const playersStats = initialData?.playersStats || {}
  const members = Object.entries(playersStats).map(([email, stats]) => ({
    email,
    name: (stats as any).alias || email.split("@")[0]
  }))

  const handleRefresh = async () => {
    setIsRefreshing(true)
    router.refresh() // Triggers server-side re-fetch
    setTimeout(() => setIsRefreshing(false), 1000) // Reset after animation
  }

  return (
    <>
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
                  <span className="hidden sm:inline">Add Entry</span>
                  <ExternalLinkIcon className="h-3 w-3" />
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                {isRefreshing ? <RefreshCwIcon className="h-4 w-4 animate-spin" /> : <RefreshCwIcon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-2">
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BeerIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Resumen</span>
              </TabsTrigger>
              <TabsTrigger value="daily-metrics" className="flex items-center gap-2">
                <BarChartIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Métricas Diarias</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <PieChartIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Descubrimientos</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              <Select
                id="member-filter"
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-[100px]"
              >
                <>
                  <option value="all">Todos</option>
                  {members.map((member) => (
                    <option key={member.email} value={member.email}>
                      {member.name}
                    </option>
                  ))}
                </>
              </Select>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-8">
            <StatsOverview data={initialData} />
            <Leaderboard data={initialData} />

            {/* Player-Month Comparison Tables */}
            <div className="grid gap-4 md:grid-cols-2">
              <PlayerMonthComparisonCard data={initialData} />
              <PlayerMonthComparisonLitersCard data={initialData} />
            </div>
          </TabsContent>

          <TabsContent value="daily-metrics" className="space-y-8">
            <div className="space-y-6">
              <DailyMetrics data={initialData} selectedMember={selectedMember} />
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-8">
            <Insights data={initialData} selectedMember={selectedMember} />
          </TabsContent>
        </Tabs>
      </main>
    </>
  )
}
