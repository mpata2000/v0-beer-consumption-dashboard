"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart } from "@mui/x-charts/PieChart"
import { Badge } from "@/components/ui/badge"
import { DashboardData } from "@/lib/types"
import { DashboardModel } from "@/lib/dashboard-model"

interface SocialInsightsProps {
  data: DashboardData | null
}

export function SocialInsights({ data }: SocialInsightsProps) {
  const model = new DashboardModel(data)
  const globalBeerAlone: number = model.globalAloneCount()
  const totalBeers: number = model.totalStats().totalBeers
  const aloneCounts = {
    Alone: globalBeerAlone,
    "With Others": Math.max(totalBeers - globalBeerAlone, 0),
  }

  // Better color palette for the pie chart - purple for Alone, green for With Others
  const pieColors = {
    "Alone": "#8b5cf6", // Purple
    "With Others": "#10b981", // Green
  }

  const aloneData = Object.entries(aloneCounts).map(([name, value], index) => ({
    id: index,
    label: name,
    value: value as number,
    color: pieColors[name as keyof typeof pieColors],
  }))

  // Calculate who drinks alone most frequently using player stats
  const emails = model.allPlayerEmails()
  const memberAloneStats = Object.fromEntries(
    emails.map(email => {
      const stats = model.playerStats(email)
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
  const locationList = Object.entries(locationCounts)
    .map(([name, value]) => ({
      name,
      count: value as number,
      percentage: totalBeers > 0 ? ((value as number / totalBeers) * 100).toFixed(1) : '0.0'
    }))
    .sort((a, b) => b.count - a.count)

  // Use pre-computed event data
  const eventCounts = data?.globalBeerEvents || {}
  const eventList = Object.entries(eventCounts)
    .map(([name, value]) => ({
      name,
      count: value as number,
      percentage: totalBeers > 0 ? ((value as number / totalBeers) * 100).toFixed(1) : '0.0'
    }))
    .sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Drinking Alone</CardTitle>
          <CardDescription>Solo vs social drinking patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Chart Section */}
            <div className="flex flex-col items-center">
              <div style={{ width: '100%', height: 250 }}>
                <PieChart
                  series={[
                    {
                      data: aloneData,
                      startAngle: -90,
                      endAngle: 90,
                      paddingAngle: 5,
                      innerRadius: '60%',
                      outerRadius: '90%',
                      highlightScope: { fade: 'global', highlight: 'item' },
                    }
                  ]}
                  width={undefined}
                  height={250}
                  margin={{ top: 10, right: 10, bottom: 0, left: 10 }}
                  sx={{
                    width: '100%',
                    '& .MuiChartsLegend-root': {
                      display: 'none !important'
                    }
                  }}
                />
              </div>

              <div className="flex justify-center gap-6 mt-4">
                {aloneData.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm text-muted-foreground">
                      ({((item.value / totalBeers) * 100).toFixed(0)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Top Solo Drinkers</h3>
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
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Locations</CardTitle>
            <CardDescription>Where beers are consumed (sorted by frequency)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {locationList.map((location, index) => (
                <div key={location.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Badge variant="outline" className="w-7 h-7 p-0 flex items-center justify-center text-xs flex-shrink-0">
                      {index + 1}
                    </Badge>
                    <span className="font-medium text-sm truncate">{location.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-sm font-semibold">{location.count}</div>
                    <div className="text-xs text-muted-foreground">{location.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
            <CardDescription>Occasions for beer consumption (sorted by frequency)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {eventList.map((event, index) => (
                <div key={event.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Badge variant="outline" className="w-7 h-7 p-0 flex items-center justify-center text-xs flex-shrink-0">
                      {index + 1}
                    </Badge>
                    <span className="font-medium text-sm truncate">{event.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-sm font-semibold">{event.count}</div>
                    <div className="text-xs text-muted-foreground">{event.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
