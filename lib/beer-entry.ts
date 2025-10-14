import { normalizeAndFormat } from "@/lib/utils"
import { EMAIL_TO_NAME } from "@/lib/members"

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

// Email-to-name mapping is centralized in lib/members.ts

export interface BeerEntry {
    timestamp: string
    brand: string
    variety: string
    date: string
    location: string
    event: string
    alone: boolean
    email: string
    amount: number
    food: string
    timeRange: string
    extra: string

    name: string
 //   parsedDate: Date
}

// Parse dd/mm/yyyy format and return normalized yyyy-mm-dd
function parseDateDDMMYYYY(dateStr: string): string {
    const parts = dateStr.split("/")

    const day = parts[0].padStart(2, "0")
    const month = parts[1].padStart(2, "0")
    const year = parts[2]

    // Return in yyyy-mm-dd format for proper sorting
    return `${year}-${month}-${day}`
  }

// Normalize time range to match expected format: "0-3", "4-7", etc.
function normalizeTimeRange(timeRange: string): string {
  if (!timeRange) return ""

  // Trim and remove common suffixes like "hs", "h"
  let normalized = timeRange.trim().replace(/hs?$/i, "").trim()

  // Remove all spaces: "20 - 23" -> "20-23", "16 - 19" -> "16-19"
  normalized = normalized.replace(/\s+/g, "")

  // Remove leading zeros: "00-03" -> "0-3", "04-07" -> "4-7"
  normalized = normalized.replace(/^0+(\d)/, "$1").replace(/-0+(\d)/, "-$1")

  return normalized
}

export function newBeerEntryFromRow(row: string[]): BeerEntry {
    const email = row[EMAIL_POSITION] || ""
    const brand = normalizeAndFormat(row[BRAND_POSITION] || "")
    const variety = normalizeAndFormat(row[TYPE_POSITION] || "")
    const rawDate = row[DATE_POSITION] || ""
    const normalizedDate = parseDateDDMMYYYY(rawDate) // Convert dd/mm/yyyy to yyyy-mm-dd
    const location = normalizeAndFormat(row[LOCATION_POSITION] || "")
    const event = normalizeAndFormat(row[EVENT_POSITION] || "")
    const alone = row[ALONE_POSITION] !== "No"
    const amount = parseInt(row[AMOUNT_POSITION] || "0", 10)
    const name = normalizeAndFormat(EMAIL_TO_NAME[email] || email.split("@")[0] || "Unknown")

    // Add to entries array (store normalized date for sorting/grouping)
    return {
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
      food: normalizeAndFormat(row[FOOD_POSITION] || ""),
      timeRange: normalizeTimeRange(row[TIME_RANGE_POSITION] || ""),
      extra: row[EXTRA_POSITION] || "",
    }
}
