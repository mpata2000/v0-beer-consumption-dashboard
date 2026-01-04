import { DashboardData, LeaderboardItem } from "@/lib/types"
import { compareIsoDatesAsc, formatDateDDMMYYYY, monthKeyFromIso, parseIsoDateToUTC } from "@/lib/utils"
import { PlayerStatsModel } from "@/lib/player-stats-model"
import { TOTAL_DAYS } from "@/lib/constants"

export class DashboardModel {
  readonly data: DashboardData | null
  readonly totalDays: number = TOTAL_DAYS

  constructor(data: DashboardData | null) {
    this.data = data
  }

  totalStats() {
    if (!this.data) {
      return { totalBeers: 0, totalLiters: 0, avgBeersPerDay: 0, avgLitersPerDay: 0, totalDays: 0 }
    }

    const totalLiters = this.data.totalMilliliters / 1000
    const days = this.totalDays
    return {
      totalBeers: this.data.totalBeers,
      totalLiters,
      avgBeersPerDay: days > 0 ? this.data.totalBeers / days : 0,
      avgLitersPerDay: days > 0 ? totalLiters / days : 0,
      totalDays: days,
    }
  }

  leaderboard(): LeaderboardItem[] {
    if (!this.data) return []
    const days = this.totalDays
    return Object.entries(this.data.playersStats)
      .map(([email, stats]) => ({
        email,
        name: stats.alias,
        beers: stats.totalBeers,
        liters: Math.round((stats.totalMilliliters / 1000) * 10) / 10,
        avgPerDay: days > 0 ? Math.round((stats.totalBeers / days) * 100) / 100 : 0,
        rank: 0,
      }))
      .sort((a, b) => b.beers - a.beers)
      .map((item, index) => ({ ...item, rank: index + 1 }))
  }

  globalBeerBrands(): Record<string, number> { return this.data?.globalBeerBrands || {} }
  globalBeerTypes(): Record<string, number> { return this.data?.globalBeerTypes || {} }
  globalBeerEvents(): Record<string, number> { return this.data?.globalBeerEvents || {} }
  globalBeerLocations(): Record<string, number> { return this.data?.globalBeerLocations || {} }
  globalBeerPerDay(): Record<string, number> { return this.data?.globalBeerPerDay || {} }
  globalMilliLitersPerDay(): Record<string, number> { return this.data?.globalMilliLitersPerDay || {} }
  globalAloneCount(): number { return this.data?.globalBeerAlone || 0 }

  playerStats(email: string): PlayerStatsModel {
    const stats = this.data ? this.data.playersStats[email] : null
    return new PlayerStatsModel(stats || null)
  }

  allPlayerEmails(): string[] {
    return this.data ? Object.keys(this.data.playersStats) : []
  }

  // ---- Daily metrics analytics ----
  chartDates(): string[] {
    const keys = Object.keys(this.globalBeerPerDay())
    return keys.sort(compareIsoDatesAsc)
  }

  // ---- Member aggregation helpers for Insights ----
  memberLocations(email: string): Record<string, number> {
    if (!this.data?.entries) return {}
    const map: Record<string, number> = {}
    for (const e of this.data.entries) {
      if (e.email !== email || !e.location) continue
      map[e.location] = (map[e.location] || 0) + 1
    }
    return map
  }

  memberEvents(email: string): Record<string, number> {
    if (!this.data?.entries) return {}
    const map: Record<string, number> = {}
    for (const e of this.data.entries) {
      if (e.email !== email || !e.event) continue
      map[e.event] = (map[e.event] || 0) + 1
    }
    return map
  }

  memberBrandList(email: string): Record<string, number> {
    if (!this.data) return {}
    return this.data.playersStats[email]?.beerBrands || {}
  }

  memberTypeList(email: string): Record<string, number> {
    if (!this.data) return {}
    return this.data.playersStats[email]?.beerTypes || {}
  }

  computePlayerMilestones(step: number = 100, max: number = 300): Map<string, Array<{ date: string; displayDate: string; member: string; beers: number; milestone: number }>> {
    const result = new Map<string, Array<{ date: string; displayDate: string; member: string; beers: number; milestone: number }>>()
    if (!this.data?.entries) return result

    const perDay = this.globalBeerPerDay()
    const chartDates = this.chartDates()

    const memberDailyData = new Map<string, Map<string, number>>()
    for (const entry of this.data.entries) {
      if (!memberDailyData.has(entry.email)) memberDailyData.set(entry.email, new Map())
      const dailyMap = memberDailyData.get(entry.email)!
      dailyMap.set(entry.date, (dailyMap.get(entry.date) || 0) + 1)
    }

    memberDailyData.forEach((dailyMap, email) => {
      const member = this.data!.entries.find(e => e.email === email)
      if (!member) return
      let memberCumulative = 0
      let lastMilestone = 0
      const milestones: Array<{ date: string; displayDate: string; member: string; beers: number; milestone: number }> = []
      chartDates.forEach(dateStr => {
        const dailyCount = dailyMap.get(dateStr) || 0
        memberCumulative += dailyCount
        const currentMilestone = Math.floor(memberCumulative / step) * step
        if (currentMilestone > lastMilestone && currentMilestone > 0 && currentMilestone <= max) {
          milestones.push({
            date: dateStr,
            displayDate: formatDateDDMMYYYY(dateStr),
            member: member.name,
            beers: memberCumulative,
            milestone: currentMilestone,
          })
          lastMilestone = currentMilestone
        }
      })
      if (milestones.length > 0) result.set(member.name, milestones)
    })

    return result
  }

  topGlobalBeerDays(limit: number = 3, uniqueTopValues: number = 2): Array<{ date: string; count: number; displayDate: string }> {
    const perDay = this.globalBeerPerDay()
    const records = Object.entries(perDay)
      .map(([date, count]) => ({ date, count: count as number, displayDate: formatDateDDMMYYYY(date) }))
      .sort((a, b) => (b.count !== a.count ? b.count - a.count : compareIsoDatesAsc(a.date, b.date)))
    if (records.length === 0) return []
    const uniqueValues = [...new Set(records.map(r => r.count))].slice(0, uniqueTopValues)
    return records.filter(r => uniqueValues.includes(r.count)).slice(0, limit)
  }

  topIndividualBeerRecords(limit: number = 3, uniqueTopValues: number = 2): Array<{ name: string; beers: number; displayDate: string; date: string }> {
    if (!this.data?.entries) return []
    const personDayTotals = new Map<string, { beers: number; date: string; name: string }>()
    for (const entry of this.data.entries) {
      const key = `${entry.email}-${entry.date}`
      const existing = personDayTotals.get(key)
      if (existing) {
        existing.beers += 1
      } else {
        personDayTotals.set(key, { beers: 1, date: entry.date, name: entry.name })
      }
    }
    const records = Array.from(personDayTotals.values())
      .map(v => ({ name: v.name, beers: v.beers, date: v.date, displayDate: formatDateDDMMYYYY(v.date) }))
      .sort((a, b) => (b.beers !== a.beers ? b.beers - a.beers : compareIsoDatesAsc(a.date, b.date)))
    if (records.length === 0) return []
    const uniqueValues = [...new Set(records.map(r => r.beers))].slice(0, uniqueTopValues)
    return records.filter(r => uniqueValues.includes(r.beers)).slice(0, limit)
  }

  topGlobalLiterDays(limit: number = 3, uniqueTopValues: number = 2): Array<{ date: string; liters: number; displayDate: string }> {
    const perDayMl = this.globalMilliLitersPerDay()
    const records = Object.entries(perDayMl)
      .map(([date, ml]) => ({ date, liters: (ml as number) / 1000, displayDate: formatDateDDMMYYYY(date) }))
      .sort((a, b) => (b.liters !== a.liters ? b.liters - a.liters : compareIsoDatesAsc(a.date, b.date)))
    if (records.length === 0) return []
    const uniqueValues = [...new Set(records.map(r => r.liters))].slice(0, uniqueTopValues)
    return records.filter(r => uniqueValues.includes(r.liters)).slice(0, limit)
  }

  topIndividualLiterRecords(limit: number = 3, uniqueTopValues: number = 2): Array<{ name: string; liters: number; displayDate: string; date: string }> {
    if (!this.data?.entries) return []
    const personDayTotals = new Map<string, { liters: number; date: string; name: string }>()
    for (const entry of this.data.entries) {
      const key = `${entry.email}-${entry.date}`
      const existing = personDayTotals.get(key)
      if (existing) {
        existing.liters += entry.amount / 1000
      } else {
        personDayTotals.set(key, { liters: entry.amount / 1000, date: entry.date, name: entry.name })
      }
    }
    const records = Array.from(personDayTotals.values())
      .map(v => ({ name: v.name, liters: v.liters, date: v.date, displayDate: formatDateDDMMYYYY(v.date) }))
      .sort((a, b) => (b.liters !== a.liters ? b.liters - a.liters : compareIsoDatesAsc(a.date, b.date)))
    if (records.length === 0) return []
    const uniqueValues = [...new Set(records.map(r => r.liters))].slice(0, uniqueTopValues)
    return records.filter(r => uniqueValues.includes(r.liters)).slice(0, limit)
  }

  monthKeys(): string[] {
    const perDay = this.globalBeerPerDay()
    const months = new Set<string>()
    for (const d of Object.keys(perDay)) {
      if (!d) continue
      months.add(monthKeyFromIso(d))
    }
    return Array.from(months).sort((a, b) => compareIsoDatesAsc(a + "-01", b + "-01"))
  }

  monthDailyCounts(monthKey: string): Record<string, number> {
    const perDay = this.globalBeerPerDay()
    const map: Record<string, number> = {}
    Object.entries(perDay).forEach(([date, count]) => {
      if (date.startsWith(monthKey)) map[date] = count || 0
    })
    return map
  }

  timeRangeTotals(): Record<string, number> {
    const entries = this.data?.entries || []
    const map: Record<string, number> = {}
    for (const e of entries) {
      if (!e.timeRange) continue
      map[e.timeRange] = (map[e.timeRange] || 0) + 1
    }
    return map
  }

  dayOfWeekTimeRangeMatrix(timeRanges: string[]): number[][] {
    const entries = this.data?.entries || []
    const matrix: number[][] = Array.from({ length: 7 }, () => Array.from({ length: timeRanges.length }, () => 0))
    for (const e of entries) {
      if (!e.date || !e.timeRange) continue
      const d = parseIsoDateToUTC(e.date)
      const js = d.getUTCDay() // 0=Sun..6=Sat
      const di = (js + 6) % 7 // Monday-first index
      const ti = timeRanges.indexOf(e.timeRange)
      if (di >= 0 && ti >= 0) matrix[di][ti] += 1
    }
    return matrix
  }
}
