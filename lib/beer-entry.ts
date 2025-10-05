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

export function newBeerEntryFromRow(row: string[]): BeerEntry {
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
      food: row[FOOD_POSITION] || "",
      timeRange: row[TIME_RANGE_POSITION] || "",
      extra: row[EXTRA_POSITION] || "",
    }
}
