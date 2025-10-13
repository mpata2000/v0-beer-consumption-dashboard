import { DashboardData } from "@/lib/types";
import { monthKeyFromIso, compareIsoDatesAsc } from "@/lib/utils";

export interface VersusComparisonData {
  label: string;
  player1Value: number;
  player2Value: number;
}

/**
 * Aggregates beer consumption by month for two players
 */
export function aggregateBeersPerMonthVersus(
  data: DashboardData | null,
  player1Email: string,
  player2Email: string
): VersusComparisonData[] {
  if (!data?.entries) return [];

  const player1MonthMap = new Map<string, number>();
  const player2MonthMap = new Map<string, number>();
  const monthsSet = new Set<string>();

  // Aggregate by month for each player
  for (const entry of data.entries) {
    const monthKey = monthKeyFromIso(entry.date);
    if (!monthKey) continue;

    monthsSet.add(monthKey);

    if (entry.email === player1Email) {
      player1MonthMap.set(monthKey, (player1MonthMap.get(monthKey) || 0) + 1);
    } else if (entry.email === player2Email) {
      player2MonthMap.set(monthKey, (player2MonthMap.get(monthKey) || 0) + 1);
    }
  }

  // Sort months chronologically
  const allMonths = Array.from(monthsSet).sort((a, b) =>
    compareIsoDatesAsc(a + "-01", b + "-01")
  );

  // Format month labels
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  return allMonths.map((monthKey) => {
    const [, m] = monthKey.split("-").map((v) => parseInt(v, 10));
    return {
      label: monthNames[(m || 1) - 1] || monthKey,
      player1Value: player1MonthMap.get(monthKey) || 0,
      player2Value: player2MonthMap.get(monthKey) || 0,
    };
  });
}

/**
 * Aggregates liter consumption by month for two players
 */
export function aggregateLitersPerMonthVersus(
  data: DashboardData | null,
  player1Email: string,
  player2Email: string
): VersusComparisonData[] {
  if (!data?.entries) return [];

  const player1MonthMap = new Map<string, number>();
  const player2MonthMap = new Map<string, number>();
  const monthsSet = new Set<string>();

  // Aggregate by month for each player
  for (const entry of data.entries) {
    const monthKey = monthKeyFromIso(entry.date);
    if (!monthKey) continue;

    monthsSet.add(monthKey);
    const liters = entry.amount / 1000;

    if (entry.email === player1Email) {
      player1MonthMap.set(monthKey, (player1MonthMap.get(monthKey) || 0) + liters);
    } else if (entry.email === player2Email) {
      player2MonthMap.set(monthKey, (player2MonthMap.get(monthKey) || 0) + liters);
    }
  }

  // Sort months chronologically
  const allMonths = Array.from(monthsSet).sort((a, b) =>
    compareIsoDatesAsc(a + "-01", b + "-01")
  );

  // Format month labels
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  return allMonths.map((monthKey) => {
    const [, m] = monthKey.split("-").map((v) => parseInt(v, 10));
    return {
      label: monthNames[(m || 1) - 1] || monthKey,
      player1Value: player1MonthMap.get(monthKey) || 0,
      player2Value: player2MonthMap.get(monthKey) || 0,
    };
  });
}

/**
 * Generic function to aggregate by a category (brand, variety, location, event)
 * Sorted by total occurrences (descending)
 */
function aggregateByCategoryVersus(
  data: DashboardData | null,
  player1Email: string,
  player2Email: string,
  categoryExtractor: (entry: any) => string
): VersusComparisonData[] {
  if (!data?.entries) return [];

  const player1Map = new Map<string, number>();
  const player2Map = new Map<string, number>();
  const categoriesSet = new Set<string>();

  // Aggregate by category for each player
  for (const entry of data.entries) {
    const category = categoryExtractor(entry);
    if (!category || category.trim() === "") continue;

    categoriesSet.add(category);

    if (entry.email === player1Email) {
      player1Map.set(category, (player1Map.get(category) || 0) + 1);
    } else if (entry.email === player2Email) {
      player2Map.set(category, (player2Map.get(category) || 0) + 1);
    }
  }

  // Calculate totals for each category and sort by total (descending)
  const categoriesWithTotals = Array.from(categoriesSet).map((category) => ({
    category,
    total: (player1Map.get(category) || 0) + (player2Map.get(category) || 0),
  }));

  categoriesWithTotals.sort((a, b) => b.total - a.total);

  return categoriesWithTotals.map(({ category }) => ({
    label: category,
    player1Value: player1Map.get(category) || 0,
    player2Value: player2Map.get(category) || 0,
  }));
}

/**
 * Aggregates beer consumption by brand for two players
 */
export function aggregateByBrandVersus(
  data: DashboardData | null,
  player1Email: string,
  player2Email: string
): VersusComparisonData[] {
  return aggregateByCategoryVersus(data, player1Email, player2Email, (entry) => entry.brand);
}

/**
 * Aggregates beer consumption by variety for two players
 */
export function aggregateByVarietyVersus(
  data: DashboardData | null,
  player1Email: string,
  player2Email: string
): VersusComparisonData[] {
  return aggregateByCategoryVersus(data, player1Email, player2Email, (entry) => entry.variety);
}

/**
 * Aggregates beer consumption by location for two players
 */
export function aggregateByLocationVersus(
  data: DashboardData | null,
  player1Email: string,
  player2Email: string
): VersusComparisonData[] {
  return aggregateByCategoryVersus(data, player1Email, player2Email, (entry) => entry.location);
}

/**
 * Aggregates beer consumption by event for two players
 */
export function aggregateByEventVersus(
  data: DashboardData | null,
  player1Email: string,
  player2Email: string
): VersusComparisonData[] {
  return aggregateByCategoryVersus(data, player1Email, player2Email, (entry) => entry.event);
}
