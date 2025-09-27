export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY

    if (!apiKey) {
      return Response.json({ error: "Google Sheets API key not configured" }, { status: 500 })
    }

    const SHEET_ID = "1KpOaqQoNpnWuYOpJE1BhMXIJinwxjlels0-Zh82r7gY"
    const RANGE = "Respuestas de formulario 1!A:L"

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${apiKey}`

    const response = await fetch(url)

    if (!response.ok) {
      return Response.json({ error: "Failed to fetch data from Google Sheets" }, { status: 400 })
    }

    const data = await response.json()

    console.log("[v0] Raw Google Sheets data rows:", data.values?.length || 0)
    console.log("[v0] First few rows:", data.values?.slice(0, 3))

    // Process the raw data
    const processedData = processSheetData(data.values)

    console.log("[v0] Processed data summary:", {
      totalBeers: processedData.totalBeers,
      totalLiters: processedData.totalLiters,
      leaderboardLength: processedData.leaderboard?.length,
      entriesLength: processedData.entries?.length,
    })

    return Response.json(processedData)
  } catch (error) {
    console.error("Error fetching sheet data:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

function processSheetData(rawData: string[][]) {
  if (!rawData || rawData.length < 2) {
    return { error: "No data found" }
  }

  const headers = rawData[0]
  const rows = rawData.slice(1)

  // Map email addresses to names
  const emailToName: { [key: string]: string } = {
    "jmartinezmadero@gmail.com": "Javi",
    "mpata2000@gmail.com": "Pata",
    "juan.tardieu@gmail.com": "Juani",
    "joaquintardieu@gmail.com": "Joaquito",
    "juancsaravia22@gmail.com": "Juancru",
  }

  const processedEntries = rows.map((row) => {
    // Parse the date from the "Fecha" column (index 3) which is in format "d/m/yyyy"
    const dateStr = row[3] || ""
    let parsedDate = new Date()

    if (dateStr) {
      const [day, month, year] = dateStr.split("/")
      if (day && month && year) {
        parsedDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
      }
    }

    return {
      timestamp: row[0] || "",
      brand: row[1] || "",
      variety: row[2] || "",
      date: dateStr,
      parsedDate,
      location: row[4] || "",
      event: row[5] || "",
      alone: row[6] || "",
      email: row[7] || "",
      name: emailToName[row[7]] || "Unknown",
      amount: Number.parseInt(row[8]) || 0,
      food: row[9] || "",
      timeRange: row[10] || "",
      extra: row[11] || "",
    }
  })

  const validEntries = processedEntries
    .filter((entry) => entry.parsedDate && !isNaN(entry.parsedDate.getTime()))
    .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())

  // Calculate statistics
  const totalBeers = validEntries.length
  const totalLiters = validEntries.reduce((sum, entry) => sum + entry.amount / 1000, 0)

  // Calculate days since February 1, 2025
  const startDate = new Date("2025-02-01")
  const today = new Date()
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  const avgBeersPerDay = totalBeers / daysSinceStart
  const avgLitersPerDay = totalLiters / daysSinceStart

  // Generate leaderboard
  const userStats: { [key: string]: { beers: number; liters: number; name: string } } = {}

  validEntries.forEach((entry) => {
    if (!userStats[entry.email]) {
      userStats[entry.email] = { beers: 0, liters: 0, name: entry.name }
    }
    userStats[entry.email].beers += 1
    userStats[entry.email].liters += entry.amount / 1000
  })

  const leaderboard = Object.entries(userStats)
    .map(([email, stats]) => ({
      email,
      name: stats.name,
      beers: stats.beers,
      liters: Math.round(stats.liters * 10) / 10,
      avgPerDay: Math.round((stats.beers / daysSinceStart) * 100) / 100,
    }))
    .sort((a, b) => b.beers - a.beers)
    .map((user, index) => ({ ...user, rank: index + 1 }))

  const progressionData = generateProgressionData(validEntries, startDate)

  return {
    totalBeers,
    totalLiters: Math.round(totalLiters * 10) / 10,
    avgBeersPerDay: Math.round(avgBeersPerDay * 100) / 100,
    avgLitersPerDay: Math.round(avgLitersPerDay * 100) / 100,
    daysSinceStart,
    leaderboard,
    entries: validEntries,
    progressionData,
    categories: {
      timeRanges: groupBy(validEntries, "timeRange"),
      locations: groupBy(validEntries, "location"),
      events: groupBy(validEntries, "event"),
      alone: groupBy(validEntries, "alone"),
    },
  }
}

function generateProgressionData(entries: any[], startDate: Date) {
  const progressionMap = new Map<string, { beers: number; liters: number }>()

  // Initialize with start date
  const startDateStr = startDate.toISOString().split("T")[0]
  progressionMap.set(startDateStr, { beers: 0, liters: 0 })

  // Group entries by date
  entries.forEach((entry) => {
    const dateStr = entry.parsedDate.toISOString().split("T")[0]
    if (!progressionMap.has(dateStr)) {
      progressionMap.set(dateStr, { beers: 0, liters: 0 })
    }
    const dayData = progressionMap.get(dateStr)!
    dayData.beers += 1
    dayData.liters += entry.amount / 1000
  })

  // Convert to array and sort by date
  const sortedDates = Array.from(progressionMap.keys()).sort()

  // Calculate cumulative values
  let cumulativeBeers = 0
  let cumulativeLiters = 0

  return sortedDates.map((dateStr) => {
    const dayData = progressionMap.get(dateStr)!
    cumulativeBeers += dayData.beers
    cumulativeLiters += dayData.liters

    return {
      date: dateStr,
      beers: dayData.beers,
      liters: Math.round(dayData.liters * 10) / 10,
      cumulative: cumulativeBeers,
      cumulativeLiters: Math.round(cumulativeLiters * 10) / 10,
    }
  })
}

function groupBy(array: any[], key: string) {
  return array.reduce((groups, item) => {
    const group = item[key] || "Unknown"
    groups[group] = (groups[group] || 0) + 1
    return groups
  }, {})
}
