export const TIME_RANGES = ["0-3", "4-7", "8-11", "12-15", "16-19", "20-23"] as const
export type TimeRange = typeof TIME_RANGES[number]

// Tournament date range (DD/MM/YYYY format displayed, ISO format internally)
export const TOURNAMENT_START_DATE = "2025-02-01" // 01/02/2025
export const TOURNAMENT_END_DATE = "2026-01-01"   // 01/01/2026

// Total days in the tournament (Feb 1, 2025 to Jan 1, 2026 = 334 days)
export const TOTAL_DAYS = 334
