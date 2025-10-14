type LocaleKey = "es" | "en"

const dictionaries: Record<LocaleKey, Record<string, string>> = {
  es: {
    loading: "Cargando...",
    addEntry: "Agregar entrada",
    refresh: "Refrescar",
    overview: "Resumen",
    dailyMetrics: "Métricas Diarias",
    insights: "Descubrimientos",
    versus: "Versus",
  },
  en: {
    loading: "Loading...",
    addEntry: "Add Entry",
    refresh: "Refresh",
    overview: "Overview",
    dailyMetrics: "Daily Metrics",
    insights: "Insights",
    versus: "Versus",
  },
}

export function t(key: string, locale: LocaleKey = "es"): string {
  const dict = dictionaries[locale] || dictionaries.es
  return dict[key] || key
}
