import {
  GoogleSheetsValuesResponse,
  BeerEntry,
  DashboardData,
} from "@/lib/types"

// Column positions in the Google Sheet
const TIMESTAMP_POSITION = 0
const BRAND_POSITION = 1
const TYPE_POSITION = 2
const DATE_POSITION = 3
const LOCATION_POSITION = 4
const EVENT_POSITION = 5
const ALONE_POSITION = 6
const EMAIL_POSITION = 7
const AMOUNT_POSITION = 8
const FOOD_POSITION = 9
const TIME_RANGE_POSITION = 10
const EXTRA_POSITION = 11

// Map email addresses to display names
const EMAIL_TO_NAME: Record<string, string> = {
  "jmartinezmadero@gmail.com": "Javi",
  "mpata2000@gmail.com": "Pata",
  "juan.tardieu@gmail.com": "Juani",
  "joaquintardieu@gmail.com": "Joaquito",
  "juancsaravia22@gmail.com": "Juancru",
}

// Parse dd/mm/yyyy format and return normalized yyyy-mm-dd
function parseDateDDMMYYYY(dateStr: string): string {
  if (!dateStr) return ""

  const parts = dateStr.split("/")
  if (parts.length !== 3) return dateStr // Return as-is if not in expected format

  const day = parts[0].padStart(2, "0")
  const month = parts[1].padStart(2, "0")
  const year = parts[2]

  // Return in yyyy-mm-dd format for proper sorting
  return `${year}-${month}-${day}`
}

interface PlayerStats {
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

function processSheetData(rawData: string[][] | undefined): DashboardData {
  if (!rawData || rawData.length < 2) {
    return {
      entries: [],
      startDate: "2025-02-01",
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
    const email = row[EMAIL_POSITION] || ""
    const brand = row[BRAND_POSITION] || ""
    const variety = row[TYPE_POSITION] || ""
    const rawDate = row[DATE_POSITION] || ""
    const normalizedDate = parseDateDDMMYYYY(rawDate) // Convert dd/mm/yyyy to yyyy-mm-dd
    const location = row[LOCATION_POSITION] || ""
    const event = row[EVENT_POSITION] || ""
    const alone = row[ALONE_POSITION] !== "No"
    const amount = parseInt(row[AMOUNT_POSITION] || "0", 10)
    const name = EMAIL_TO_NAME[email] || email.split("@")[0] || "Unknown"

    // Add to entries array (store normalized date for sorting/grouping)
    entries.push({
      timestamp: row[TIMESTAMP_POSITION] || "",
      brand,
      variety,
      date: normalizedDate, // Store as yyyy-mm-dd
      location,
      event,
      alone,
      email,
      name,
      amount,
      food: row[FOOD_POSITION] || "",
      timeRange: row[TIME_RANGE_POSITION] || "",
      extra: row[EXTRA_POSITION] || "",
    })

    // Global aggregations (use normalized date)
    totalBeers += 1
    totalMilliliters += amount
    globalBeerBrands[brand] = (globalBeerBrands[brand] || 0) + 1
    globalBeerTypes[variety] = (globalBeerTypes[variety] || 0) + 1
    globalBeerEvents[event] = (globalBeerEvents[event] || 0) + 1
    globalBeerLocations[location] = (globalBeerLocations[location] || 0) + 1
    if (alone) globalBeerAlone += 1
    globalBeerPerDay[normalizedDate] = (globalBeerPerDay[normalizedDate] || 0) + 1
    globalMilliLitersPerDay[normalizedDate] = (globalMilliLitersPerDay[normalizedDate] || 0) + amount

    // Player-specific aggregations
    if (!playersStats[email]) {
      playersStats[email] = {
        alias: name,
        totalBeers: 0,
        totalMilliliters: 0,
        drankAlone: 0,
        placeCounter: {},
        beerTypes: {},
        beerBrands: {},
        beerPerDay: {},
        litersPerDay: {},
      }
    }

    const playerStats = playersStats[email]
    playerStats.totalBeers += 1
    playerStats.totalMilliliters += amount
    playerStats.drankAlone += alone ? 1 : 0
    playerStats.placeCounter[location] = (playerStats.placeCounter[location] || 0) + 1
    playerStats.beerTypes[variety] = (playerStats.beerTypes[variety] || 0) + 1
    playerStats.beerBrands[brand] = (playerStats.beerBrands[brand] || 0) + 1
    playerStats.beerPerDay[normalizedDate] = (playerStats.beerPerDay[normalizedDate] || 0) + 1
    playerStats.litersPerDay[normalizedDate] = (playerStats.litersPerDay[normalizedDate] || 0) + amount
  }

  return {
    entries,
    startDate: "2025-02-01",
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
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID
  const range = process.env.GOOGLE_SHEETS_RANGE

  if (!apiKey || !spreadsheetId || !range) {
    console.error("Google Sheets not configured")
    return null
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`

  try {
    const response = await fetch(url, {
      cache: "no-store", // Always get fresh data
    })

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
