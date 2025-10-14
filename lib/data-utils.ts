import { DashboardData, LeaderboardItem } from "@/lib/types"
import { parseIsoDateToUTC, monthKeyFromIso, compareIsoDatesAsc } from "@/lib/utils"
import { DashboardModel } from "@/lib/dashboard-model"
import { TIME_RANGES } from "@/lib/constants"

export { TIME_RANGES }

/**
 * Formats a month key (yyyy-mm) as a short label in Spanish (e.g., "Ene", "Feb")
 */
export function formatMonthKeyLabel(monthKey: string): string {
  if (!monthKey) return "";
  const [y, m] = monthKey.split("-").map((v) => parseInt(v, 10));
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  return monthNames[(m || 1) - 1] || "";
}

/**
 * Aggregates beer consumption by month and player
 * Returns a map of player email -> month key -> beer count
 */
export function aggregateBeersPerMonthByPlayer(
  data: DashboardData | null
): {
  playerMonthData: Map<string, Map<string, number>>;
  allMonths: string[];
  playerNames: Map<string, string>;
} {
  const playerMonthData = new Map<string, Map<string, number>>();
  const playerNames = new Map<string, string>();
  const monthsSet = new Set<string>();

  if (!data?.entries) {
    return { playerMonthData, allMonths: [], playerNames };
  }

  // Aggregate by player and month
  for (const entry of data.entries) {
    const monthKey = monthKeyFromIso(entry.date);
    if (!monthKey) continue;

    monthsSet.add(monthKey);

    // Store player name
    if (!playerNames.has(entry.email)) {
      const stats = data.playersStats[entry.email];
      playerNames.set(entry.email, stats?.alias || entry.name);
    }

    // Initialize player map if needed
    if (!playerMonthData.has(entry.email)) {
      playerMonthData.set(entry.email, new Map<string, number>());
    }

    const monthMap = playerMonthData.get(entry.email)!;
    monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
  }

  // Sort months chronologically
  const allMonths = Array.from(monthsSet).sort((a, b) =>
    compareIsoDatesAsc(a + "-01", b + "-01")
  );

  return { playerMonthData, allMonths, playerNames };
}

/**
 * Aggregates liter consumption by month and player
 * Returns a map of player email -> month key -> liter count
 */
export function aggregateLitersPerMonthByPlayer(
  data: DashboardData | null
): {
  playerMonthData: Map<string, Map<string, number>>;
  allMonths: string[];
  playerNames: Map<string, string>;
} {
  const playerMonthData = new Map<string, Map<string, number>>();
  const playerNames = new Map<string, string>();
  const monthsSet = new Set<string>();

  if (!data?.entries) {
    return { playerMonthData, allMonths: [], playerNames };
  }

  // Aggregate by player and month
  for (const entry of data.entries) {
    const monthKey = monthKeyFromIso(entry.date);
    if (!monthKey) continue;

    monthsSet.add(monthKey);

    // Store player name
    if (!playerNames.has(entry.email)) {
      const stats = data.playersStats[entry.email];
      playerNames.set(entry.email, stats?.alias || entry.name);
    }

    // Initialize player map if needed
    if (!playerMonthData.has(entry.email)) {
      playerMonthData.set(entry.email, new Map<string, number>());
    }

    const monthMap = playerMonthData.get(entry.email)!;
    // Convert milliliters to liters
    const liters = entry.amount / 1000;
    monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + liters);
  }

  // Sort months chronologically
  const allMonths = Array.from(monthsSet).sort((a, b) =>
    compareIsoDatesAsc(a + "-01", b + "-01")
  );

  return { playerMonthData, allMonths, playerNames };
}

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
