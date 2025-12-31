"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrophyIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import type { DashboardData } from "@/lib/types"
import { useMemo, useState } from "react"
import { formatDateDDMMYYYY } from "@/lib/utils"

interface BeerStreak {
  name: string
  email: string
  beers: number
  liters: number
  startDate: string
  startTimeRange: string
  endDate: string
  endTimeRange: string
  entries: Array<{
    date: string
    timeRange: string
    brand: string
    variety: string
    amount: number
  }>
}

interface DetailedEntry {
  count: number
  brand: string
  variety: string
  amount: number
  timeRange: string
  date: string
}

// Time ranges in order for consecutive checking
const TIME_RANGES = ["0-3", "4-7", "8-11", "12-15", "16-19", "20-23"]

function getTimeRangeIndex(timeRange: string): number {
  return TIME_RANGES.indexOf(timeRange)
}

function calculateBeersInRow(data: DashboardData | null, selectedMember: string): BeerStreak[] {
  if (!data?.entries) return []

  // Filter entries by selected member
  const entries = selectedMember === "all" ? data.entries : data.entries.filter((e) => e.email === selectedMember)

  // Group entries by person, date, and time range
  const grouped = new Map<
    string,
    Array<{
      date: string
      timeRange: string
      brand: string
      variety: string
      amount: number
    }>
  >()

  for (const entry of entries) {
    if (!entry.timeRange || !entry.date) continue

    const key = `${entry.email}|${entry.date}|${entry.timeRange}`
    if (!grouped.has(key)) {
      grouped.set(key, [])
    }
    grouped.get(key)!.push({
      date: entry.date,
      timeRange: entry.timeRange,
      brand: entry.brand,
      variety: entry.variety,
      amount: entry.amount,
    })
  }

  // Sort all entries by person, date, and time range
  const sortedKeys = Array.from(grouped.keys()).sort((a, b) => {
    const [emailA, dateA, timeA] = a.split("|")
    const [emailB, dateB, timeB] = b.split("|")

    if (emailA !== emailB) return emailA.localeCompare(emailB)
    if (dateA !== dateB) return dateA.localeCompare(dateB)
    return getTimeRangeIndex(timeA) - getTimeRangeIndex(timeB)
  })

  // Find all streaks
  const allStreaks: BeerStreak[] = []
  let currentStreak: BeerStreak | null = null

  for (const key of sortedKeys) {
    const [email, date, timeRange] = key.split("|")
    const beerEntries = grouped.get(key)!
    const name = entries.find((e) => e.email === email)?.name || email
    const beerCount = beerEntries.length
    const liters = beerEntries.reduce((sum, e) => sum + e.amount, 0) / 1000

    if (!currentStreak) {
      // Start a new streak
      currentStreak = {
        name,
        email,
        beers: beerCount,
        liters,
        startDate: date,
        startTimeRange: timeRange,
        endDate: date,
        endTimeRange: timeRange,
        entries: beerEntries,
      }
    } else {
      // Check if this continues the streak
      const prevTimeIndex = getTimeRangeIndex(currentStreak.endTimeRange)
      const currTimeIndex = getTimeRangeIndex(timeRange)

      let isConsecutive = false

      // Same date, next time range
      if (currentStreak.endDate === date && currTimeIndex === prevTimeIndex + 1) {
        isConsecutive = true
      }
      // Next day, wrapping from 20-23 to 0-3
      else if (currentStreak.endTimeRange === "20-23" && timeRange === "0-3") {
        const prevDate: Date = new Date(currentStreak.endDate)
        prevDate.setUTCDate(prevDate.getUTCDate() + 1)
        const nextDay = prevDate.toISOString().split("T")[0]
        if (date === nextDay) {
          isConsecutive = true
        }
      }

      if (isConsecutive && currentStreak.email === email) {
        // Continue the streak
        currentStreak.beers += beerCount
        currentStreak.liters += liters
        currentStreak.endDate = date
        currentStreak.endTimeRange = timeRange
        currentStreak.entries.push(...beerEntries)
      } else {
        // End current streak and start a new one
        allStreaks.push(currentStreak)
        currentStreak = {
          name,
          email,
          beers: beerCount,
          liters,
          startDate: date,
          startTimeRange: timeRange,
          endDate: date,
          endTimeRange: timeRange,
          entries: beerEntries,
        }
      }
    }
  }

  // Don't forget the last streak
  if (currentStreak) {
    allStreaks.push(currentStreak)
  }

  // Sort by beer count and return top streaks
  return allStreaks.sort((a, b) => b.beers - a.beers)
}

function StreakDetails({ entries }: { entries: BeerStreak["entries"] }) {
  // Merge entries: count occurrences of same brand/variety/amount/timeRange/date
  const merged = new Map<string, DetailedEntry>()

  for (const entry of entries) {
    const key = `${entry.brand}|${entry.variety}|${entry.amount}|${entry.timeRange}|${entry.date}`
    if (merged.has(key)) {
      merged.get(key)!.count++
    } else {
      merged.set(key, {
        count: 1,
        brand: entry.brand,
        variety: entry.variety,
        amount: entry.amount,
        timeRange: entry.timeRange,
        date: entry.date,
      })
    }
  }

  const sortedEntries = Array.from(merged.values()).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return getTimeRangeIndex(a.timeRange) - getTimeRangeIndex(b.timeRange)
  })

  return (
    <div className="mt-3 space-y-1.5 text-xs">
      {sortedEntries.map((entry, i) => (
        <div key={i} className="flex items-center justify-between px-2 py-1 rounded bg-muted/30">
          <span className="font-medium text-foreground/90">
            {entry.count > 1 && `${entry.count}x `}
            {entry.brand} {entry.variety} {entry.amount}ml
          </span>
          <span className="text-muted-foreground text-[10px]">
            {entry.timeRange} {formatDateDDMMYYYY(entry.date)}
          </span>
        </div>
      ))}
    </div>
  )
}

interface BeersInRowCardProps {
  data: DashboardData | null
  selectedMember: string
}

export function BeersInRowCard({ data, selectedMember }: BeersInRowCardProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const topStreaks = useMemo(() => {
    const streaks = calculateBeersInRow(data, selectedMember)
    return streaks.slice(0, 5)
  }, [data, selectedMember])

  if (topStreaks.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrophyIcon className="h-5 w-5 text-primary" />
            Birras Seguidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrophyIcon className="h-5 w-5 text-primary" />
          Birras Seguidas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topStreaks.map((streak, index) => {
          const isExpanded = expandedIndex === index
          const isSameDay = streak.startDate === streak.endDate

          return (
            <div key={index} className="border border-border/50 rounded-lg bg-card">
              <button onClick={() => setExpandedIndex(isExpanded ? null : index)} className="w-full text-left">
                <div className="p-3 hover:bg-muted/30 transition-colors rounded-lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-base text-foreground">{streak.name}</span>
                        <span className="text-sm text-muted-foreground">#{index + 1}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                        <span className="font-medium text-primary">{streak.beers} birras</span>
                        <span className="text-muted-foreground">{streak.liters.toFixed(1)}L</span>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {isSameDay ? (
                          <span>
                            {formatDateDDMMYYYY(streak.startDate)} · {streak.startTimeRange}
                            {streak.startTimeRange !== streak.endTimeRange && ` - ${streak.endTimeRange}`}
                          </span>
                        ) : (
                          <span>
                            {formatDateDDMMYYYY(streak.startDate)} {streak.startTimeRange} →{" "}
                            {formatDateDDMMYYYY(streak.endDate)} {streak.endTimeRange}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-muted-foreground">
                      {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                    </div>
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 border-t border-border/30">
                  <StreakDetails entries={streak.entries} />
                </div>
              )}
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
