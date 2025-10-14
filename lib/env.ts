import { z } from "zod"

const EnvSchema = z.object({
  GOOGLE_SHEETS_API_KEY: z.string().min(1, "Missing GOOGLE_SHEETS_API_KEY"),
  GOOGLE_SHEETS_SPREADSHEET_ID: z.string().min(1, "Missing GOOGLE_SHEETS_SPREADSHEET_ID"),
  GOOGLE_SHEETS_RANGE: z.string().min(1, "Missing GOOGLE_SHEETS_RANGE"),
})

const parsed = EnvSchema.safeParse({
  GOOGLE_SHEETS_API_KEY: process.env.GOOGLE_SHEETS_API_KEY,
  GOOGLE_SHEETS_SPREADSHEET_ID: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
  GOOGLE_SHEETS_RANGE: process.env.GOOGLE_SHEETS_RANGE,
})

if (!parsed.success) {
  // Log all issues for quick setup debugging; consumers can decide how to handle null data
  const errors = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")
  console.error(`[env] Configuration error: ${errors}`)
}

export const env = parsed.success ? parsed.data : {
  GOOGLE_SHEETS_API_KEY: "",
  GOOGLE_SHEETS_SPREADSHEET_ID: "",
  GOOGLE_SHEETS_RANGE: "",
}
