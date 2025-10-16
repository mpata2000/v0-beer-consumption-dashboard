import { NextResponse } from "next/server"
import { revalidateTag } from "next/cache"

export async function POST() {
  try {
    revalidateTag("beer-data")
    return NextResponse.json({ revalidated: true })
  } catch (e) {
    return NextResponse.json({ revalidated: false, error: String(e) }, { status: 500 })
  }
}
