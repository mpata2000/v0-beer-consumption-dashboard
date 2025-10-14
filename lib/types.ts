import { BeerEntry } from "@/lib/beer-entry"

export interface GoogleSheetsValuesResponse {
  range?: string
  majorDimension?: string
  values?: string[][]
}

export interface LeaderboardItem {
  rank: number
  email: string
  name: string
  beers: number
  liters: number
  avgPerDay: number
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
  entries: BeerEntry[]
}

export interface DashboardData {
  entries: BeerEntry[]
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
