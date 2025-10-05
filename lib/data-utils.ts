import { DashboardData, LeaderboardItem } from "@/lib/types"
import { parseIsoDateToUTC } from "@/lib/utils"

export function calculateDaysSinceStart(startDate: string): number {
  // Use UTC-safe parsing to avoid timezone off-by-one
  const start = parseIsoDateToUTC(startDate)
  const now = new Date()
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  return Math.floor((todayUTC.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export function calculateTotalStats(data: DashboardData | null) {
  if (!data) {
    return {
      totalBeers: 0,
      totalLiters: 0,
      avgBeersPerDay: 0,
      avgLitersPerDay: 0,
      daysSinceStart: 0,
    }
  }

  const totalLiters = data.totalMilliliters / 1000
  const daysSinceStart = calculateDaysSinceStart(data.startDate)

  return {
    totalBeers: data.totalBeers,
    totalLiters,
    avgBeersPerDay: daysSinceStart > 0 ? data.totalBeers / daysSinceStart : 0,
    avgLitersPerDay: daysSinceStart > 0 ? totalLiters / daysSinceStart : 0,
    daysSinceStart,
  }
}

export function calculateLeaderboard(data: DashboardData | null): LeaderboardItem[] {
  if (!data) return []

  const daysSinceStart = calculateDaysSinceStart(data.startDate)

  // Use pre-computed player stats
  return Object.entries(data.playersStats)
    .map(([email, stats]) => ({
      email,
      name: stats.alias,
      beers: stats.totalBeers,
      liters: Math.round((stats.totalMilliliters / 1000) * 10) / 10,
      avgPerDay: daysSinceStart > 0 ? Math.round((stats.totalBeers / daysSinceStart) * 100) / 100 : 0,
      rank: 0,
    }))
    .sort((a, b) => b.beers - a.beers)
    .map((item, index) => ({ ...item, rank: index + 1 }))
}

// All these just return pre-computed data (no loops!)
export function getGlobalBeerBrands(data: DashboardData | null): Record<string, number> {
  return data?.globalBeerBrands || {}
}

export function getGlobalBeerTypes(data: DashboardData | null): Record<string, number> {
  return data?.globalBeerTypes || {}
}

export function getGlobalBeerEvents(data: DashboardData | null): Record<string, number> {
  return data?.globalBeerEvents || {}
}

export function getGlobalBeerLocations(data: DashboardData | null): Record<string, number> {
  return data?.globalBeerLocations || {}
}

export function getGlobalBeerPerDay(data: DashboardData | null): Record<string, number> {
  return data?.globalBeerPerDay || {}
}

export function getGlobalMilliLitersPerDay(data: DashboardData | null): Record<string, number> {
  return data?.globalMilliLitersPerDay || {}
}

export function getGlobalAloneCount(data: DashboardData | null): number {
  return data?.globalBeerAlone || 0
}

export function getPlayerStats(data: DashboardData | null, email: string) {
  if (!data || !data.playersStats[email]) {
    return {
      alias: "",
      totalBeers: 0,
      totalMilliliters: 0,
      drankAlone: 0,
      beerTypes: {},
      beerBrands: {},
      locations: {},
      beerPerDay: {},
      litersPerDay: {},
    }
  }

  const stats = data.playersStats[email]
  return {
    alias: stats.alias,
    totalBeers: stats.totalBeers,
    totalMilliliters: stats.totalMilliliters,
    drankAlone: stats.drankAlone,
    beerTypes: stats.beerTypes,
    beerBrands: stats.beerBrands,
    locations: stats.placeCounter,
    beerPerDay: stats.beerPerDay,
    litersPerDay: stats.litersPerDay,
  }
}

export function getAllPlayerEmails(data: DashboardData | null): string[] {
  if (!data) return []
  return Object.keys(data.playersStats)
}
