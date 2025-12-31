"use client"

import { CardDescription } from "@/components/ui/card"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMemo } from "react"

interface PlayerMonthGridProps {
  title: string
  description: string
  playerMonthData: Map<string, Map<string, number>>
  allMonths: string[]
  playerNames: Map<string, string>
  colorRgb: string // e.g., "59,130,246" for blue or "16,185,129" for green
  decimalPlaces?: number
  unit?: string // e.g., "birras" or "L"
}

function intensityColor(value: number, maxValue: number, colorRgb: string): string {
  if (!maxValue || value <= 0) return `rgba(${colorRgb},0.08)` // faint
  const t = Math.min(1, value / maxValue)
  const alpha = 0.25 + 0.55 * t
  return `rgba(${colorRgb},${alpha})`
}

function abbreviatePlayerName(name: string): string {
  const abbreviations: Record<string, string> = {
    Joaquito: "Joaco",
    Juancru: "Acru",
  }
  return abbreviations[name] || name
}

function getShortMonthLabel(monthKey: string): string {
  if (!monthKey) return ""
  const [year, month] = monthKey.split("-")
  const monthNames = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]
  const monthIndex = Number.parseInt(month, 10) - 1
  const shortYear = year?.slice(-2) || ""
  return `${monthNames[monthIndex] || "?"}${shortYear}`
}

function getFullMonthLabel(monthKey: string): string {
  if (!monthKey) return ""
  const [year, month] = monthKey.split("-")
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const monthIndex = Number.parseInt(month, 10) - 1
  return monthNames[monthIndex] || ""
}

export function PlayerMonthGrid({
  title,
  description,
  playerMonthData,
  allMonths,
  playerNames,
  colorRgb,
  decimalPlaces = 0,
  unit = "",
}: PlayerMonthGridProps) {
  // Get sorted player emails (by total descending)
  const sortedPlayers = useMemo(() => {
    const playerTotals = Array.from(playerMonthData.entries()).map(([email, monthMap]) => {
      const total = Array.from(monthMap.values()).reduce((sum, count) => sum + count, 0)
      return { email, total }
    })
    return playerTotals.sort((a, b) => b.total - a.total).map(({ email }) => email)
  }, [playerMonthData])

  // Calculate max value for color intensity
  const maxValue = useMemo(() => {
    let max = 0
    for (const monthMap of playerMonthData.values()) {
      for (const count of monthMap.values()) {
        if (count > max) max = count
      }
    }
    return max
  }, [playerMonthData])

  // Calculate monthly totals
  const monthlyTotals = useMemo(() => {
    const totals = new Map<string, number>()
    for (const month of allMonths) {
      let sum = 0
      for (const email of sortedPlayers) {
        const monthMap = playerMonthData.get(email)
        sum += monthMap?.get(month) || 0
      }
      totals.set(month, sum)
    }
    return totals
  }, [allMonths, sortedPlayers, playerMonthData])

  // Calculate player totals
  const playerTotals = useMemo(() => {
    const totals = new Map<string, number>()
    for (const email of sortedPlayers) {
      const monthMap = playerMonthData.get(email)
      const total = monthMap ? Array.from(monthMap.values()).reduce((sum, count) => sum + count, 0) : 0
      totals.set(email, total)
    }
    return totals
  }, [sortedPlayers, playerMonthData])

  if (sortedPlayers.length === 0 || allMonths.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>No hay datos disponibles</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const formatValue = (value: number) => {
    if (decimalPlaces > 0) {
      return value > 0 ? value.toFixed(decimalPlaces) : ""
    }
    return value || ""
  }

  return (
    <Card className="w-full max-w-full">
      <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6">
        <CardTitle className="text-sm sm:text-base md:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden px-1 sm:px-4 pb-3 sm:pb-6">
        <div className="overflow-x-auto -mx-1 px-1">
          <div
            className="grid gap-0.5 min-w-fit"
            style={{
              gridTemplateColumns: `minmax(28px, 40px) repeat(${sortedPlayers.length}, minmax(32px, 1fr)) minmax(28px, 40px)`,
              display: "grid",
            }}
          >
            {/* Header row */}
            <div className="text-[8px] sm:text-xs font-semibold text-muted-foreground py-0.5" />
            {sortedPlayers.map((email) => {
              const displayName = playerNames.get(email) || email.split("@")[0]
              const mobileDisplayName = abbreviatePlayerName(displayName)
              return (
                <div
                  key={email}
                  className="text-[8px] sm:text-xs font-semibold text-center text-muted-foreground py-0.5 px-0.5 truncate"
                  title={displayName}
                >
                  <span className="sm:hidden">{mobileDisplayName}</span>
                  <span className="hidden sm:inline">{displayName}</span>
                </div>
              )
            })}
            <div className="text-[8px] sm:text-xs font-semibold text-center text-muted-foreground py-0.5">
              <span className="hidden sm:inline">Total</span>
              <span className="sm:hidden">T</span>
            </div>

            {/* Data rows */}
            {allMonths.map((month) => {
              const fullLabel = getFullMonthLabel(month)
              const shortLabel = getShortMonthLabel(month)
              return (
                <div key={`row-${month}`} className="contents">
                  <div
                    className="text-[7px] sm:text-xs text-muted-foreground h-7 sm:h-9 flex items-center font-medium pr-0.5"
                    title={fullLabel}
                  >
                    <span>{fullLabel}</span>
                  </div>
                  {sortedPlayers.map((email) => {
                    const monthMap = playerMonthData.get(email)
                    const value = monthMap?.get(month) || 0
                    const displayName = playerNames.get(email) || email.split("@")[0]
                    return (
                      <div
                        key={`${email}-${month}`}
                        className="h-7 sm:h-9 rounded-sm flex items-center justify-center text-[8px] sm:text-xs font-medium"
                        style={{
                          backgroundColor: intensityColor(value, maxValue, colorRgb),
                        }}
                        title={`${displayName} - ${fullLabel}: ${value.toFixed(decimalPlaces)}${unit}`}
                      >
                        {formatValue(value)}
                      </div>
                    )
                  })}
                  <div className="h-7 sm:h-9 flex items-center justify-center text-[8px] sm:text-xs font-bold bg-muted/30 rounded-sm">
                    {(monthlyTotals.get(month) || 0).toFixed(decimalPlaces)}
                  </div>
                </div>
              )
            })}

            {/* Total row - hidden on mobile */}
            <div className="hidden sm:flex text-xs text-muted-foreground h-9 items-center font-bold border-t border-border pt-1">
              Total
            </div>
            {sortedPlayers.map((email) => (
              <div
                key={`player-total-${email}`}
                className="hidden sm:flex h-9 items-center justify-center text-xs font-bold bg-muted/50 rounded-sm border-t border-border"
              >
                {(playerTotals.get(email) || 0).toFixed(decimalPlaces)}
              </div>
            ))}
            <div
              className="hidden sm:flex h-9 items-center justify-center text-xs font-bold rounded-sm border-t border-border"
              style={{ backgroundColor: `rgba(${colorRgb}, 0.3)` }}
            >
              {Array.from(playerTotals.values())
                .reduce((sum, count) => sum + count, 0)
                .toFixed(decimalPlaces)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
