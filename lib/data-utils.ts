import { DashboardData, LeaderboardItem } from "@/lib/types"
import { parseIsoDateToUTC } from "@/lib/utils"
import { DashboardModel } from "@/lib/dashboard-model"

export function calculateDaysSinceStart(startDate: string): number {
  // Use UTC-safe parsing to avoid timezone off-by-one
  const start = parseIsoDateToUTC(startDate)
  const now = new Date()
  const todayUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  return Math.floor((todayUTC.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export function calculateTotalStats(data: DashboardData | null) {
  return new DashboardModel(data).totalStats()
}

export function calculateLeaderboard(data: DashboardData | null): LeaderboardItem[] {
  return new DashboardModel(data).leaderboard()
}

export function getGlobalBeerBrands(data: DashboardData | null): Record<string, number> {
  return new DashboardModel(data).globalBeerBrands()
}

export function getGlobalBeerTypes(data: DashboardData | null): Record<string, number> {
  return new DashboardModel(data).globalBeerTypes()
}

export function getGlobalBeerEvents(data: DashboardData | null): Record<string, number> {
  return new DashboardModel(data).globalBeerEvents()
}

export function getGlobalBeerLocations(data: DashboardData | null): Record<string, number> {
  return new DashboardModel(data).globalBeerLocations()
}

export function getGlobalBeerPerDay(data: DashboardData | null): Record<string, number> {
  return new DashboardModel(data).globalBeerPerDay()
}

export function getGlobalMilliLitersPerDay(data: DashboardData | null): Record<string, number> {
  return new DashboardModel(data).globalMilliLitersPerDay()
}

export function getGlobalAloneCount(data: DashboardData | null): number {
  return new DashboardModel(data).globalAloneCount()
}

export function getPlayerStats(data: DashboardData | null, email: string) {
  return new DashboardModel(data).playerStats(email)
}

export function getAllPlayerEmails(data: DashboardData | null): string[] {
  return new DashboardModel(data).allPlayerEmails()
}
