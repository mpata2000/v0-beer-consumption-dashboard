import { PlayerStats } from "@/lib/types"

export class PlayerStatsModel {
  readonly raw: PlayerStats | null

  constructor(raw: PlayerStats | null) {
    this.raw = raw
  }

  get alias(): string {
    return this.raw?.alias || ""
  }

  get totalBeers(): number {
    return this.raw?.totalBeers || 0
  }

  get totalMilliliters(): number {
    return this.raw?.totalMilliliters || 0
  }

  get drankAlone(): number {
    return this.raw?.drankAlone || 0
  }

  get beerTypes(): Record<string, number> {
    return this.raw?.beerTypes || {}
  }

  get beerBrands(): Record<string, number> {
    return this.raw?.beerBrands || {}
  }

  get locations(): Record<string, number> {
    return this.raw?.placeCounter || {}
  }

  get beerPerDay(): Record<string, number> {
    return this.raw?.beerPerDay || {}
  }

  get litersPerDay(): Record<string, number> {
    return this.raw?.litersPerDay || {}
  }

  get totalLiters(): number {
    return Math.round((this.totalMilliliters / 1000) * 100) / 100
  }

  // ---- Per-player daily analytics ----
  dailyBeerCounts(): Record<string, number> {
    return this.raw?.beerPerDay || {}
  }

  dailyLiterCounts(): Record<string, number> {
    return this.raw?.litersPerDay || {}
  }

  topBeerDayRecords(limit: number = 3, uniqueTopValues: number = 2): Array<{ beers: number; date: string }> {
    const perDay = this.dailyBeerCounts()
    const records = Object.entries(perDay)
      .map(([date, beers]) => ({ date, beers: beers as number }))
      .sort((a, b) => (b.beers !== a.beers ? b.beers - a.beers : a.date.localeCompare(b.date)))
    if (records.length === 0) return []
    const uniqueValues = [...new Set(records.map(r => r.beers))].slice(0, uniqueTopValues)
    return records.filter(r => uniqueValues.includes(r.beers)).slice(0, limit)
  }

  topLiterDayRecords(limit: number = 3, uniqueTopValues: number = 2): Array<{ liters: number; date: string }> {
    const perDayMl = this.dailyLiterCounts()
    const records = Object.entries(perDayMl)
      .map(([date, ml]) => ({ date, liters: (ml as number) / 1000 }))
      .sort((a, b) => (b.liters !== a.liters ? b.liters - a.liters : a.date.localeCompare(b.date)))
    if (records.length === 0) return []
    const uniqueValues = [...new Set(records.map(r => r.liters))].slice(0, uniqueTopValues)
    return records.filter(r => uniqueValues.includes(r.liters)).slice(0, limit)
  }
}
