"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart } from "@mui/x-charts/LineChart"
import { PieChart } from "@mui/x-charts/PieChart"
import { BarChart } from "@mui/x-charts/BarChart"
import { ChartsAxisHighlight } from "@mui/x-charts/ChartsAxisHighlight"
import { ChartsTooltip } from "@mui/x-charts/ChartsTooltip"
import { DashboardData } from "@/lib/types"
import { getGlobalBeerPerDay } from "@/lib/data-utils"
import { compareIsoDatesAsc, formatDateDDMMYYYY, monthKeyFromIso, monthMetaFromKey, parseIsoDateToUTC } from "@/lib/utils"
import { useMemo, useState } from "react"

interface DailyMetricsProps {
  data: DashboardData | null
}

// Define vibrant colors for better readability
const CHART_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
]

interface Milestone {
  date: string
  displayDate: string
  member: string
  beers: number
  milestone: number
}

export function DailyMetrics({ data }: DailyMetricsProps) {
  const perDay: Record<string, number> = getGlobalBeerPerDay(data)
  const chartDates = Object.keys(perDay).sort(compareIsoDatesAsc)
  let cumulative = 0
  const chartData = chartDates.map((dateStr) => {
    const daily = perDay[dateStr] || 0
    cumulative += daily
    return {
      date: formatDateDDMMYYYY(dateStr),
      cumulative,
    }
  })

  // Calculate per-person milestones and global milestone markers
  const { milestonesByPlayer, globalMilestoneMarkers } = (() => {
    if (!data?.entries) return { milestonesByPlayer: new Map<string, Milestone[]>(), globalMilestoneMarkers: [] }

    // Group entries by member and date
    const memberDailyData = new Map<string, Map<string, number>>()
    data.entries.forEach(entry => {
      if (!memberDailyData.has(entry.email)) {
        memberDailyData.set(entry.email, new Map())
      }

      const dailyMap = memberDailyData.get(entry.email)!
      dailyMap.set(entry.date, (dailyMap.get(entry.date) || 0) + 1)
    })

    // Calculate milestones for each member
    const playerMilestones = new Map<string, Milestone[]>()
    const globalMarkers: Array<{ date: string; displayDate: string; milestone: number; index: number }> = []

    memberDailyData.forEach((dailyMap, email) => {
      const member = data.entries.find(e => e.email === email)
      if (!member) return

      let memberCumulative = 0
      let lastMilestone = 0
      const memberMilestones: Milestone[] = []

      chartDates.forEach(dateStr => {
        const dailyCount = dailyMap.get(dateStr) || 0
        memberCumulative += dailyCount

        // Check for milestone crossings (100, 200, 300, etc.)
        const currentMilestone = Math.floor(memberCumulative / 100) * 100
        if (currentMilestone > lastMilestone && currentMilestone > 0 && currentMilestone <= 300) {
          memberMilestones.push({
            date: dateStr,
            displayDate: formatDateDDMMYYYY(dateStr),
            member: member.name,
            beers: memberCumulative,
            milestone: currentMilestone
          })
          lastMilestone = currentMilestone
        }
      })

      if (memberMilestones.length > 0) {
        playerMilestones.set(member.name, memberMilestones)
      }
    })

    // Find global milestones (when the TOTAL reached 100, 200, 300)
    let globalCumulative = 0
    let lastGlobalMilestone = 0
    chartDates.forEach((dateStr, idx) => {
      const dailyCount = perDay[dateStr] || 0
      globalCumulative += dailyCount

      const currentMilestone = Math.floor(globalCumulative / 100) * 100
      if (currentMilestone > lastGlobalMilestone && currentMilestone > 0 && currentMilestone <= 300) {
        globalMarkers.push({
          date: dateStr,
          displayDate: formatDateDDMMYYYY(dateStr),
          milestone: currentMilestone,
          index: idx
        })
        lastGlobalMilestone = currentMilestone
      }
    })

    return { milestonesByPlayer: playerMilestones, globalMilestoneMarkers: globalMarkers }
  })()

  // Find top global peak days (up to 3 records with top 2 unique values)
  const topGlobalDays = (() => {
    const dailyRecords = Object.entries(perDay)
      .map(([date, count]) => ({
        date,
        count: count as number,
        displayDate: formatDateDDMMYYYY(date)
      }))
      .sort((a, b) => {
        // Sort by count descending, then by date ascending
        if (b.count !== a.count) return b.count - a.count
        return compareIsoDatesAsc(a.date, b.date)
      })

    if (dailyRecords.length === 0) return []

    // Get unique top 2 values
    const uniqueValues = [...new Set(dailyRecords.map(r => r.count))].slice(0, 2)

    // Get all records with those top values, limit to 3 total
    return dailyRecords
      .filter(r => uniqueValues.includes(r.count))
      .slice(0, 3)
  })()

  // Find top individual records (up to 3 records with top 2 unique values)
  const topIndividualRecords = (() : Array<{ name: string; beers: number; displayDate: string; date: string }> => {
    if (!data?.entries) return []

    // Group by person and date
    const personDayTotals = new Map<string, { beers: number; date: string; name: string }>()
    data.entries.forEach(entry => {
      const key = `${entry.email}-${entry.date}`
      const existing = personDayTotals.get(key)
      if (existing) {
        existing.beers += 1
      } else {
        personDayTotals.set(key, {
          beers: 1,
          date: entry.date,
          name: entry.name,
        })
      }
    })

    // Convert to array and sort
    const records = Array.from(personDayTotals.values())
      .map(value => ({
        name: value.name,
        beers: value.beers,
        date: value.date,
        displayDate: formatDateDDMMYYYY(value.date),
      }))
      .sort((a, b) => {
        // Sort by beers descending, then by date ascending
        if (b.beers !== a.beers) return b.beers - a.beers
        return compareIsoDatesAsc(a.date, b.date)
      })

    if (records.length === 0) return []

    // Get unique top 2 values
    const uniqueValues = [...new Set(records.map(r => r.beers))].slice(0, 2)

    // Get all records with those top values, limit to 3 total
    return records
      .filter(r => uniqueValues.includes(r.beers))
      .slice(0, 3)
  })()

  // -----------------------------
  // New: Calendar Heatmap (per-day in selected month)
  // -----------------------------
  const entries = data?.entries || []

  const monthKeys = useMemo(() => {
    const months = new Set<string>()
    for (const d of Object.keys(perDay)) {
      if (!d) continue
      months.add(monthKeyFromIso(d))
    }
    return Array.from(months).sort((a, b) => compareIsoDatesAsc(a + "-01", b + "-01"))
  }, [perDay])

  const [selectedMonth, setSelectedMonth] = useState<string>(() => monthKeys[monthKeys.length - 1] || "")

  const monthDailyCounts = useMemo(() => {
    if (!selectedMonth) return {}
    const map: Record<string, number> = {}
    Object.entries(perDay).forEach(([date, count]) => {
      if (date.startsWith(selectedMonth)) {
        map[date] = count
      }
    })
    return map
  }, [perDay, selectedMonth])

  const monthMeta = useMemo(() => {
    if (!selectedMonth) return { year: 0, monthIndex: 0, daysInMonth: 0, firstWeekday: 0 }
    const v = monthMetaFromKey(selectedMonth)
    return { year: v.year, monthIndex: v.monthIndex, daysInMonth: v.daysInMonth, firstWeekday: v.firstWeekdayMondayFirst }
  }, [selectedMonth])

  const monthMax = useMemo(() => {
    let max = 0
    Object.values(monthDailyCounts).forEach((v) => { if (v > max) max = v })
    return max
  }, [monthDailyCounts])

  function intensityColor(value: number, maxValue: number): string {
    if (!maxValue || value <= 0) return "rgba(59,130,246,0.08)" // faint
    const t = Math.min(1, value / maxValue)
    // blue scale from light to strong
    const alpha = 0.25 + 0.55 * t
    return `rgba(59,130,246,${alpha})`
  }

  function formatMonthLabel(key: string) {
    if (!key) return ""
    const [y, m] = key.split("-").map((v) => parseInt(v, 10))
    const dt = new Date(Date.UTC(y, m - 1, 1))
    const month = dt.toLocaleString('en-US', { month: 'long', timeZone: 'UTC' })
    return `${month} ${y}`
  }

  const weekRows = useMemo(() => {
    const rows: Array<Array<{ day: number | null; dateStr: string | null; count: number }>> = []
    if (!selectedMonth) return rows
    const { year, monthIndex, daysInMonth, firstWeekday } = monthMeta
    let currentDay = 1
    for (let r = 0; r < 6; r++) {
      const row: Array<{ day: number | null; dateStr: string | null; count: number }> = []
      for (let c = 0; c < 7; c++) {
        const cellIndex = r * 7 + c
        if (cellIndex < firstWeekday || currentDay > daysInMonth) {
          row.push({ day: null, dateStr: null, count: 0 })
        } else {
          const day = currentDay
          const date = new Date(year, monthIndex, day)
          const yyyy = date.getFullYear()
          const mm = String(date.getMonth() + 1).padStart(2, "0")
          const dd = String(date.getDate()).padStart(2, "0")
          const key = `${yyyy}-${mm}-${dd}`
          row.push({ day, dateStr: key, count: monthDailyCounts[key] || 0 })
          currentDay += 1
        }
      }
      rows.push(row)
    }
    return rows
  }, [selectedMonth, monthMeta, monthDailyCounts])

  // -----------------------------
  // New: Day-of-week vs Time-range Heatmap (global)
  // -----------------------------
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  function getIsoDayIndex(dateStr: string): number {
    const d = parseIsoDateToUTC(dateStr)
    const js = d.getUTCDay() // 0=Sun..6=Sat
    return (js + 6) % 7 // 0=Mon..6=Sun
  }

  const timeRanges = useMemo(() => {
    const set = new Set<string>()
    for (const e of entries) {
      if (e.timeRange) set.add(e.timeRange)
    }
    const list = Array.from(set)
    // Try to sort by numeric start hour if present
    list.sort((a, b) => {
      const pa = parseInt(a.trim().split(/[^0-9]+/)[0] || "0", 10)
      const pb = parseInt(b.trim().split(/[^0-9]+/)[0] || "0", 10)
      return pa - pb
    })
    return list
  }, [entries])

  const heatmapCounts = useMemo(() => {
    const matrix: number[][] = Array.from({ length: dayLabels.length }, () => Array.from({ length: timeRanges.length }, () => 0))
    for (const e of entries) {
      if (!e.date || !e.timeRange) continue
      const di = getIsoDayIndex(e.date)
      const ti = timeRanges.indexOf(e.timeRange)
      if (di >= 0 && ti >= 0) matrix[di][ti] += 1
    }
    return matrix
  }, [entries, timeRanges])

  const heatmapMax = useMemo(() => {
    let max = 0
    for (const row of heatmapCounts) {
      for (const v of row) if (v > max) max = v
    }
    return max
  }, [heatmapCounts])

  // -----------------------------
  // New: Time-range pie chart (global)
  // -----------------------------
  const timeRangeTotals = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of entries) {
      if (!e.timeRange) continue
      map[e.timeRange] = (map[e.timeRange] || 0) + 1
    }
    return map
  }, [entries])

  const timeRangePieData = useMemo(() => {
    const entriesList = Object.entries(timeRangeTotals)
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
      '#22c55e', '#eab308', '#a855f7', '#14b8a6'
    ]
    return entriesList.map(([label, value], idx) => ({ id: idx, label, value, color: colors[idx % colors.length] }))
  }, [timeRangeTotals])


  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Peak Day</CardTitle>
            <CardDescription>Most beers consumed in one day</CardDescription>
          </CardHeader>
          <CardContent>
            {topGlobalDays.length > 0 ? (
              <div className="space-y-1">
                <div>
                  <div className="text-2xl font-bold">{topGlobalDays[0].count}</div>
                  <p className="text-xs text-muted-foreground">{topGlobalDays[0].displayDate}</p>
                </div>
                {topGlobalDays.slice(1).map((record, idx) => (
                  <div key={idx} className="pt-1 border-t border-border/50">
                    <div className={idx === 0 ? "text-lg font-semibold text-muted-foreground" : "text-sm font-medium text-muted-foreground"}>{record.count}</div>
                    <p className="text-xs text-muted-foreground">{record.displayDate}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No data</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Individual Record</CardTitle>
            <CardDescription>Most beers by one person in a day</CardDescription>
          </CardHeader>
          <CardContent>
            {topIndividualRecords.length > 0 ? (
              <div className="space-y-1">
                <div>
                  <div className="text-2xl font-bold">{topIndividualRecords[0].beers}</div>
                  <p className="text-xs text-muted-foreground">
                    {topIndividualRecords[0].name} on {topIndividualRecords[0].displayDate}
                  </p>
                </div>
                {topIndividualRecords.slice(1).map((record, idx) => (
                  <div key={idx} className="pt-1 border-t border-border/50">
                    <div className={idx === 0 ? "text-lg font-semibold text-muted-foreground" : "text-sm font-medium text-muted-foreground"}>{record.beers}</div>
                    <p className="text-xs text-muted-foreground">
                      {record.name} on {record.displayDate}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">No data</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Beer Consumption</CardTitle>
          <CardDescription>Global cumulative progression over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 500, position: 'relative' }}>
            <LineChart
              dataset={chartData}
              width={undefined}
              height={500}
              xAxis={[{
                dataKey: 'date',
                scaleType: 'point',
                tickLabelStyle: {
                  angle: -45,
                  textAnchor: 'end',
                  fontSize: 12,
                  fill: 'white',
                }
              }]}
              yAxis={[
                {
                  id: 'cumulative',
                  label: 'Cumulative Beers',
                  scaleType: 'linear',
                  tickLabelStyle: {
                    fill: 'white',
                  },
                  labelStyle: {
                    fill: 'white',
                  }
                }
              ]}
              series={[
                {
                  dataKey: 'cumulative',
                  label: 'Total Beers',
                  color: CHART_COLORS[0],
                  showMark: true,
                  curve: 'monotoneX',
                  valueFormatter: (value: number | null) => value ? `${value} beers` : '',
                }
              ]}
              grid={{ horizontal: true, vertical: false }}
              margin={{ top: 40, right: 30, left: 70, bottom: 80 }}
              sx={{
                width: '100%',
                '& .MuiLineElement-root': {
                  strokeWidth: 3,
                },
                '& .MuiMarkElement-root': {
                  scale: '0.8',
                  strokeWidth: 2,
                },
                '& .MuiChartsAxis-line': {
                  stroke: 'white',
                },
                '& .MuiChartsAxis-tick': {
                  stroke: 'white',
                },
              }}
            />

            {/* Player milestone markers */}
            {Array.from(milestonesByPlayer.entries()).map(([playerName, playerMilestones], playerIdx) => {
              return playerMilestones.map((milestone, milestoneIdx) => {
                const dateIndex = chartDates.indexOf(milestone.date)
                if (dateIndex === -1) return null

                const chartWidth = typeof window !== 'undefined' ? window.innerWidth : 1200
                const effectiveWidth = Math.min(chartWidth - 100, 1200)
                const xPosition = 70 + (dateIndex / (chartDates.length - 1 || 1)) * effectiveWidth

                return (
                  <div
                    key={`${playerName}-${milestoneIdx}`}
                    style={{
                      position: 'absolute',
                      left: `${xPosition}px`,
                      top: '80px',
                      bottom: '80px',
                      width: '2px',
                      backgroundColor: CHART_COLORS[playerIdx % CHART_COLORS.length],
                      opacity: 0.3,
                      pointerEvents: 'none',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: `${10 + playerIdx * 20}px`,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '10px',
                        fontWeight: 600,
                        color: CHART_COLORS[playerIdx % CHART_COLORS.length],
                        whiteSpace: 'nowrap',
                        textShadow: '0 0 4px rgba(0,0,0,0.9)',
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        padding: '2px 4px',
                        borderRadius: '3px',
                      }}
                    >
                      {playerName.split(' ')[0]} {milestone.milestone}
                    </div>
                  </div>
                )
              })
            })}
          </div>

          {/* Player Milestone Achievements */}
          {milestonesByPlayer.size > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold mb-4">🎯 Player Milestones</h3>
              <div className="space-y-4">
                {Array.from(milestonesByPlayer.entries()).map(([playerName, playerMilestones], playerIdx) => (
                  <div key={playerName} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: CHART_COLORS[playerIdx % CHART_COLORS.length] }}
                      />
                      <h4 className="text-sm font-semibold">{playerName}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 ml-5">
                      {playerMilestones.map((milestone, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border/50"
                        >
                          <div>
                            <div className="text-xs text-muted-foreground">{milestone.displayDate}</div>
                          </div>
                          <div className="text-base font-bold" style={{ color: CHART_COLORS[playerIdx % CHART_COLORS.length] }}>
                            {milestone.milestone}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Section: Heatmaps and Time-range insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Calendar Heatmap</CardTitle>
            <CardDescription>Select a month to see beers per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4 gap-4">
              <div className="text-sm text-muted-foreground">{selectedMonth ? formatMonthLabel(selectedMonth) : "No data"}</div>
              <select
                className="bg-transparent border border-border rounded-md px-2 py-1 text-sm"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {monthKeys.map((m) => (
                  <option key={m} value={m}>{formatMonthLabel(m)}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                <div className="grid grid-cols-7 gap-1 mb-2 text-xs text-muted-foreground">
                  {dayLabels.map((d) => (
                    <div key={d} className="text-center">{d}</div>
                  ))}
                </div>
                <div className="grid grid-rows-6 gap-1">
                  {weekRows.map((row, ri) => (
                    <div key={ri} className="grid grid-cols-7 gap-1">
                      {row.map((cell, ci) => (
                        <div
                          key={ci}
                          className="h-10 rounded-sm flex flex-col items-center justify-center text-[10px]"
                          style={{ backgroundColor: intensityColor(cell.count, monthMax) }}
                          title={cell.dateStr ? `${cell.dateStr}: ${cell.count} birras` : ""}
                        >
                          {cell.day !== null && (
                            <>
                              <div className="leading-none">{cell.day}</div>
                              <div className="leading-none">{cell.count > 0 ? `${cell.count} birras` : ""}</div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <span>Low</span>
                  <div className="flex-1 h-2 bg-gradient-to-r from-[rgba(59,130,246,0.2)] to-[rgba(59,130,246,0.8)] rounded" />
                  <span>High</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Heatmap: Day of Week × Time Range</CardTitle>
            <CardDescription>Counts across the full dataset</CardDescription>
          </CardHeader>
          <CardContent>
            {timeRanges.length === 0 ? (
              <div className="text-sm text-muted-foreground">No time range data</div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                  <div className="grid" style={{ gridTemplateColumns: `100px repeat(${timeRanges.length}, minmax(60px, 1fr))` }}>
                    <div />
                    {timeRanges.map((tr) => (
                      <div key={tr} className="text-xs text-center text-muted-foreground py-1">{tr}</div>
                    ))}
                    {dayLabels.map((day, di) => (
                      <>
                        <div key={`label-${day}`} className="text-xs text-muted-foreground py-1 flex items-center">{day}</div>
                        {timeRanges.map((tr, ti) => (
                          <div
                            key={`${day}-${tr}`}
                            className="h-8 rounded-sm flex items-center justify-center text-[10px]"
                            style={{ backgroundColor: intensityColor(heatmapCounts[di][ti], heatmapMax) }}
                            title={`${day} @ ${tr}: ${heatmapCounts[di][ti]}`}
                          >
                            {heatmapCounts[di][ti] || ""}
                          </div>
                        ))}
                      </>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                    <span>Low</span>
                    <div className="flex-1 h-2 bg-gradient-to-r from-[rgba(59,130,246,0.2)] to-[rgba(59,130,246,0.8)] rounded" />
                    <span>High</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time Range Distribution</CardTitle>
            <CardDescription>Share of beers by time range</CardDescription>
          </CardHeader>
          <CardContent>
            {timeRangePieData.length === 0 ? (
              <div className="text-sm text-muted-foreground">No time range data</div>
            ) : (
              <div>
                <div style={{ width: '100%', height: 260 }}>
                  <PieChart
                    series={[{
                      data: timeRangePieData,
                      startAngle: -90,
                      endAngle: 270,
                      paddingAngle: 2,
                      innerRadius: '50%',
                      outerRadius: '90%',
                      highlightScope: { fade: 'global', highlight: 'item' },
                    }]}
                    width={undefined}
                    height={260}
                    margin={{ top: 10, right: 10, bottom: 0, left: 10 }}
                    sx={{ width: '100%' }}
                  />
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  {timeRangePieData.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
