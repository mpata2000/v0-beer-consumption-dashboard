import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TopListItem {
  name: string
  count: number
  percentage: string
}

interface TopListCardProps {
  title: string
  description?: string
  items: TopListItem[]
  maxHeight?: string
}

export function TopListCard({ title, description, items, maxHeight = "400px" }: TopListCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-2 overflow-y-auto" style={{ maxHeight }}>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
          ) : (
            items.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Badge variant="outline" className="w-7 h-7 p-0 flex items-center justify-center text-xs flex-shrink-0">
                    {index + 1}
                  </Badge>
                  <span className="font-medium text-sm truncate">{item.name}</span>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <div className="text-sm font-semibold">{item.count}</div>
                  <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
