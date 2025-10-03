export interface GoogleSheetsValuesResponse {
  range?: string
  majorDimension?: string
  values?: string[][]
}

export interface BeerEntry {
  timestamp: string
  brand: string
  variety: string
  date: string
  location: string
  event: string
  alone: boolean
  email: string
  name: string
  amount: number
  food: string
  timeRange: string
  extra: string
}

export interface LeaderboardItem {
  rank: number
  email: string
  name: string
  beers: number
  liters: number
  avgPerDay: number
}

export interface ProgressionPoint {
  date: string
  beers: number
  liters: number
  cumulative: number
  cumulativeLiters: number
}

export interface PlayerStats {
  alias: string
  totalBeers: number
  totalMilliliters: number
  drankAlone: number
  placeCounter: Record<string, number>
  beerTypes: Record<string, number>
  beerBrands: Record<string, number>
  beerPerDay: Record<string, number>
  litersPerDay: Record<string, number>
}

export interface DashboardData {
  entries: BeerEntry[]
  startDate: string // "2025-02-01"
  // Pre-computed aggregations (calculated in one pass for efficiency)
  totalBeers: number
  totalMilliliters: number
  globalBeerBrands: Record<string, number>
  globalBeerTypes: Record<string, number>
  globalBeerEvents: Record<string, number>
  globalBeerLocations: Record<string, number>
  globalBeerAlone: number
  globalBeerPerDay: Record<string, number>
  globalMilliLitersPerDay: Record<string, number>
  playersStats: Record<string, PlayerStats>
}

export interface ErrorResponse {
  error: string
}

export type FetchDataResult = DashboardData | ErrorResponse
