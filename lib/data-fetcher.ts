import {
  GoogleSheetsValuesResponse,
  DashboardData,
} from "@/lib/types"

import { BeerEntry, newBeerEntryFromRow } from "@/lib/beer-entry"
import { env } from "@/lib/env"




import type { PlayerStats } from "@/lib/types"

function processSheetData(rawData: string[][] | undefined): DashboardData {
  if (!rawData || rawData.length < 2) {
    return {
      entries: [],
      totalBeers: 0,
      totalMilliliters: 0,
      globalBeerBrands: {},
      globalBeerTypes: {},
      globalBeerEvents: {},
      globalBeerLocations: {},
      globalBeerAlone: 0,
      globalBeerPerDay: {},
      globalMilliLitersPerDay: {},
      playersStats: {},
    }
  }

  const rows = rawData.slice(1)
  const entries: BeerEntry[] = []

  // Single-pass aggregation (efficient!)
  let totalBeers = 0
  let totalMilliliters = 0
  const playersStats: Record<string, PlayerStats> = {}
  const globalBeerBrands: Record<string, number> = {}
  const globalBeerTypes: Record<string, number> = {}
  const globalBeerEvents: Record<string, number> = {}
  const globalBeerLocations: Record<string, number> = {}
  let globalBeerAlone = 0
  const globalBeerPerDay: Record<string, number> = {}
  const globalMilliLitersPerDay: Record<string, number> = {}

  for (const row of rows) {
    const beerEntry = newBeerEntryFromRow(row)
    // Add to entries array (store normalized date for sorting/grouping)
    entries.push(beerEntry)
    // Global aggregations (use normalized date)
    totalBeers += 1
    totalMilliliters += beerEntry.amount
    globalBeerBrands[beerEntry.brand] = (globalBeerBrands[beerEntry.brand] || 0) + 1
    globalBeerTypes[beerEntry.variety] = (globalBeerTypes[beerEntry.variety] || 0) + 1
    globalBeerEvents[beerEntry.event] = (globalBeerEvents[beerEntry.event] || 0) + 1
    globalBeerLocations[beerEntry.location] = (globalBeerLocations[beerEntry.location] || 0) + 1
    if (beerEntry.alone) globalBeerAlone += 1
    globalBeerPerDay[beerEntry.date] = (globalBeerPerDay[beerEntry.date] || 0) + 1
    globalMilliLitersPerDay[beerEntry.date] = (globalMilliLitersPerDay[beerEntry.date] || 0) + beerEntry.amount

    // Player-specific aggregations
    if (!playersStats[beerEntry.email]) {
      playersStats[beerEntry.email] = {
        alias: beerEntry.name,
        totalBeers: 0,
        totalMilliliters: 0,
        drankAlone: 0,
        placeCounter: {},
        beerTypes: {},
        beerBrands: {},
        beerPerDay: {},
        litersPerDay: {},
        entries: [],
      }
    }

    const playerStats = playersStats[beerEntry.email]
    playerStats.entries.push(beerEntry)
    playerStats.totalBeers += 1
    playerStats.totalMilliliters += beerEntry.amount
    playerStats.drankAlone += beerEntry.alone ? 1 : 0
    playerStats.placeCounter[beerEntry.location] = (playerStats.placeCounter[beerEntry.location] || 0) + 1
    playerStats.beerTypes[beerEntry.variety] = (playerStats.beerTypes[beerEntry.variety] || 0) + 1
    playerStats.beerBrands[beerEntry.brand] = (playerStats.beerBrands[beerEntry.brand] || 0) + 1
    playerStats.beerPerDay[beerEntry.date] = (playerStats.beerPerDay[beerEntry.date] || 0) + 1
    playerStats.litersPerDay[beerEntry.date] = (playerStats.litersPerDay[beerEntry.date] || 0) + beerEntry.amount
  }

  return {
    entries,
    totalBeers,
    totalMilliliters,
    globalBeerBrands,
    globalBeerTypes,
    globalBeerEvents,
    globalBeerLocations,
    globalBeerAlone,
    globalBeerPerDay,
    globalMilliLitersPerDay,
    playersStats,
  }
}

export async function fetchBeerData(): Promise<DashboardData | null> {
  const apiKey = env.GOOGLE_SHEETS_API_KEY
  const spreadsheetId = env.GOOGLE_SHEETS_SPREADSHEET_ID
  const range = env.GOOGLE_SHEETS_RANGE

  if (!apiKey || !spreadsheetId || !range) {
    console.error("Google Sheets not configured")
    return null
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`

  try {
    const response = await fetch(url, { next: { revalidate: 600 } })

    if (!response.ok) {
      console.error("Failed to fetch data from Google Sheets")
      return null
    }

    const data: GoogleSheetsValuesResponse = await response.json()
    const processedData = processSheetData(data.values)

    console.log(`[v0] Fetched ${processedData.entries.length} beer entries`)

    return processedData
  } catch (error) {
    console.error("Error fetching sheet data:", error)
    return null
  }
}
