import { DashboardClient } from "@/components/dashboard-client"
import { fetchBeerData } from "@/lib/data-fetcher"

// This is now a Server Component - fetches data on the server
export default async function BeerDashboard() {
  const data = await fetchBeerData()

  return (
    <div className="min-h-screen bg-background">
      {data ? (
        <DashboardClient initialData={data} />
      ) : (
        <div className="container mx-auto px-6 py-8">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-2">No se pudo cargar los datos</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Verifica la configuración de Google Sheets o intenta refrescar la página.
            </p>
            <div className="flex gap-2">
              <a href="/" className="text-sm underline">Reintentar</a>
              <a href="https://forms.gle/yNnGcQaCy98FGSQp9" target="_blank" rel="noopener noreferrer" className="text-sm underline">Agregar entrada</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
