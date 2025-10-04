import { DashboardClient } from "@/components/dashboard-client"
import { fetchBeerData } from "@/lib/data-fetcher"

// This is now a Server Component - fetches data on the server
export default async function BeerDashboard() {
  const data = await fetchBeerData()

  return (
    <div className="min-h-screen bg-background">
      <DashboardClient initialData={data} />
    </div>
  )
}
