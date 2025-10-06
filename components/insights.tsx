"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { PieChart } from "@mui/x-charts/PieChart"
import { TopListCard } from "@/components/top-list-card"
import { DashboardData } from "@/lib/types"
import { DashboardModel } from "@/lib/dashboard-model"
import { normalizeRecord } from "@/lib/data-utils"

interface InsightsProps {
  data: DashboardData | null
}

export function Insights({ data }: InsightsProps) {
  const [selectedMember, setSelectedMember] = useState<string>("all")

  const model = new DashboardModel(data)
  const playersStats: Record<string, any> = data?.playersStats || {}

  // Get list of members for the dropdown
  const members = Object.entries(playersStats).map(([email, stats]) => ({
    email,
    name: stats.alias || email.split("@")[0]
  }))

  // Get data based on selected member
  const getMemberData = () => {
    if (selectedMember === "all") {
      return {
        brands: model.globalBeerBrands(),
        types: model.globalBeerTypes(),
        locations: data?.globalBeerLocations || {},
        events: data?.globalBeerEvents || {},
        totalBeers: model.totalStats().totalBeers,
        aloneCount: model.globalAloneCount()
      }
    } else {
      const memberStats = playersStats[selectedMember]
      if (memberStats) {
        // Calculate member-specific location and event counts from entries
        const memberEntries = data?.entries.filter(e => e.email === selectedMember) || []
        const locations: Record<string, number> = {}
        const events: Record<string, number> = {}

        memberEntries.forEach(entry => {
          if (entry.place) {
            locations[entry.place] = (locations[entry.place] || 0) + 1
          }
          if (entry.event) {
            events[entry.event] = (events[entry.event] || 0) + 1
          }
        })

        return {
          brands: memberStats.beerBrands || {},
          types: memberStats.beerTypes || {},
          locations,
          events,
          totalBeers: memberStats.totalBeers || 0,
          aloneCount: memberStats.drankAlone || 0
        }
      }
      return { brands: {}, types: {}, locations: {}, events: {}, totalBeers: 0, aloneCount: 0 }
    }
  }

  const { brands, types, locations, events, totalBeers, aloneCount } = getMemberData()

  // Normalize and transform data to lists with percentages
  const normalizedBrands = normalizeRecord(brands)
  const brandList = Object.values(normalizedBrands)
    .map((item) => ({
      name: item.normalized,
      count: item.count,
      percentage: totalBeers > 0 ? ((item.count / totalBeers) * 100).toFixed(1) : '0.0'
    }))
    .sort((a, b) => b.count - a.count)

  const normalizedTypes = normalizeRecord(types)
  const typeList = Object.values(normalizedTypes)
    .map((item) => ({
      name: item.normalized,
      count: item.count,
      percentage: totalBeers > 0 ? ((item.count / totalBeers) * 100).toFixed(1) : '0.0'
    }))
    .sort((a, b) => b.count - a.count)

  const normalizedLocations = normalizeRecord(locations)
  const locationList = Object.values(normalizedLocations)
    .map((item) => ({
      name: item.normalized,
      count: item.count,
      percentage: totalBeers > 0 ? ((item.count / totalBeers) * 100).toFixed(1) : '0.0'
    }))
    .sort((a, b) => b.count - a.count)

  const normalizedEvents = normalizeRecord(events)
  const eventList = Object.values(normalizedEvents)
    .map((item) => ({
      name: item.normalized,
      count: item.count,
      percentage: totalBeers > 0 ? ((item.count / totalBeers) * 100).toFixed(1) : '0.0'
    }))
    .sort((a, b) => b.count - a.count)

  // Calculate alone/with others data
  const aloneCounts = {
    Alone: aloneCount,
    "With Others": Math.max(totalBeers - aloneCount, 0),
  }

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

  // Calculate top solo drinkers (only for "all" view)
  const aloneLeaderboard = selectedMember === "all"
    ? Object.entries(playersStats)
        .map(([email, stats]: [string, any]) => ({
          member: stats.alias || email.split("@")[0],
          aloneCount: stats.drankAlone || 0,
          totalCount: stats.totalBeers || 0,
          percentage: stats.totalBeers > 0 ? Math.round((stats.drankAlone / stats.totalBeers) * 100) : 0,
        }))
        .filter((member) => member.aloneCount > 0)
        .sort((a, b) => b.aloneCount - a.aloneCount)
        .slice(0, 5)
    : []

  // Calculate top brands per member (only for "all" view)
  const memberTopBrands = selectedMember === "all"
    ? Object.entries(playersStats)
        .map(([member, stats]: [string, any]) => {
          const normalizedBrands = normalizeRecord(stats.beerBrands || {})
          const brandList = Object.values(normalizedBrands)
            .map((item) => ({ brand: item.normalized, count: item.count }))
            .sort((a, b) => b.count - a.count)

          return {
            member: stats.alias || member.split("@")[0],
            brands: brandList,
            uniqueBrands: brandList.length,
          }
        })
        .filter((member) => member.uniqueBrands >= 3)
        .map((member) => ({
          ...member,
          topThree: member.brands.slice(0, 3),
        }))
    : []

  const selectedMemberName = selectedMember === "all"
    ? "Todos"
    : members.find(m => m.email === selectedMember)?.name || "Todos"

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <label htmlFor="member-filter" className="text-sm font-medium">
          Filtrar por miembro:
        </label>
        <Select
          id="member-filter"
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          className="w-[200px]"
        >
          <option value="all">Todos</option>
          {members.map((member) => (
            <option key={member.email} value={member.email}>
              {member.name}
            </option>
          ))}
        </Select>
      </div>

      {/* Beer Brands and Types */}
      <div className="grid gap-6 md:grid-cols-2">
        <TopListCard
          title="Marcas de Cerveza"
          description={`Marcas de ${selectedMemberName}`}
          items={brandList}
        />
        <TopListCard
          title="Variedades de Cerveza"
          description={`Variedades de ${selectedMemberName}`}
          items={typeList}
        />
      </div>

      {/* Top Brands per Member (only in "all" view) */}
      {memberTopBrands.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Marcas de Cerveza por Miembro</CardTitle>
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

      {/* Drinking Alone Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Tomando solo</CardTitle>
          <CardDescription>
            {selectedMember === "all"
              ? "Estadísticas globales"
              : `Estadísticas de ${selectedMemberName}`
            }
          </CardDescription>
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
                      ({totalBeers > 0 ? ((item.value / totalBeers) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leaderboard Section (only for "all" view) */}
            {aloneLeaderboard.length > 0 && (
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
            )}
          </div>
        </CardContent>
      </Card>

      {/* Locations and Events */}
      <div className="grid gap-6 md:grid-cols-2">
        <TopListCard
          title="Lugares"
          description={`Lugares de ${selectedMemberName}`}
          items={locationList}
        />
        <TopListCard
          title="Events"
          description={`Eventos de ${selectedMemberName}`}
          items={eventList}
        />
      </div>
    </div>
  )
}
