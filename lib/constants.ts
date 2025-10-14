export const TIME_RANGES = ["0-3", "4-7", "8-11", "12-15", "16-19", "20-23"] as const
export type TimeRange = typeof TIME_RANGES[number]
