import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utilities to ensure consistent handling of dd/mm/yyyy source and normalized ISO (yyyy-mm-dd)
// Always avoid `new Date(string)` with ISO-only date because of timezone shifts; use UTC constructors.

export function parseIsoDateToUTC(dateIso: string): Date {
  // dateIso expected as yyyy-mm-dd
  const [y, m, d] = dateIso.split('-').map((v) => parseInt(v, 10))
  if (!y || !m || !d) return new Date(NaN)
  // Use UTC to avoid TZ skew
  return new Date(Date.UTC(y, m - 1, d))
}

export function formatDateDDMMYYYY(dateIso: string): string {
  const dt = parseIsoDateToUTC(dateIso)
  if (isNaN(dt.getTime())) return dateIso
  const dd = String(dt.getUTCDate()).padStart(2, '0')
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0')
  const yyyy = String(dt.getUTCFullYear())
  return `${dd}/${mm}/${yyyy}`
}

export function compareIsoDatesAsc(aIso: string, bIso: string): number {
  // Safe numeric compare using UTC
  const a = parseIsoDateToUTC(aIso).getTime()
  const b = parseIsoDateToUTC(bIso).getTime()
  return a - b
}

export function monthKeyFromIso(dateIso: string): string {
  // yyyy-mm
  if (!dateIso || dateIso.length < 7) return ''
  return dateIso.slice(0, 7)
}

export function monthMetaFromKey(monthKey: string): { year: number; monthIndex: number; daysInMonth: number; firstWeekdayMondayFirst: number } {
  // monthKey = yyyy-mm
  const [y, m] = monthKey.split('-').map((v) => parseInt(v, 10))
  const year = y
  const monthIndex = (m || 1) - 1
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
  // Monday-first index (0..6)
  const js = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay() // 0=Sun..6=Sat
  const firstWeekdayMondayFirst = (js + 6) % 7
  return { year, monthIndex, daysInMonth, firstWeekdayMondayFirst }
}

// String normalization utilities
export function normalizeString(str: string): string {
  // Lowercase and trim spaces
  return str.toLowerCase().trim()
}

export function toTitleCase(str: string): string {
  // Convert to title case
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function normalizeAndFormat(str: string): string {
  // Normalize then format as title case
  return toTitleCase(normalizeString(str))
}
