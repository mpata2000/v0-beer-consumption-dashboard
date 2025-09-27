"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Chart configuration context
const ChartContext = React.createContext<{
  config: Record<string, { label?: string; color?: string }>
}>({ config: {} })

interface ChartContainerProps extends React.ComponentPropsWithoutRef<"div"> {
  config: Record<string, { label?: string; color?: string }>
  children: React.ReactNode
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ className, config, children, ...props }, ref) => {
    return (
      <ChartContext.Provider value={{ config }}>
        <div
          ref={ref}
          className={cn("w-full", className)}
          style={
            {
              "--chart-1": "hsl(var(--chart-1))",
              "--chart-2": "hsl(var(--chart-2))",
              "--chart-3": "hsl(var(--chart-3))",
              "--chart-4": "hsl(var(--chart-4))",
              "--chart-5": "hsl(var(--chart-5))",
            } as React.CSSProperties
          }
          {...props}
        >
          {children}
        </div>
      </ChartContext.Provider>
    )
  }
)
ChartContainer.displayName = "ChartContainer"

interface ChartTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string | number
  content?: React.ComponentType<ChartTooltipContentProps>
}

interface ChartTooltipContentProps {
  active?: boolean
  payload?: any[]
  label?: string | number
  hideLabel?: boolean
  hideIndicator?: boolean
  labelFormatter?: (label: any) => string
  valueFormatter?: (value: any) => string
  className?: string
}

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(({ active, payload, label, hideLabel, hideIndicator, labelFormatter, valueFormatter, className }, ref) => {
  const { config } = React.useContext(ChartContext)

  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-background p-2 shadow-sm",
        className
      )}
    >
      {!hideLabel && label !== undefined && (
        <div className="text-xs font-medium text-muted-foreground mb-1">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((item, index) => {
          const configItem = config[item.dataKey as string] || {}
          const value = valueFormatter ? valueFormatter(item.value) : item.value
          
          return (
            <div key={index} className="flex items-center gap-2 text-xs">
              {!hideIndicator && (
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color || configItem.color }}
                />
              )}
              <span className="font-medium">
                {configItem.label || item.name}:
              </span>
              <span className="text-muted-foreground">{value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartTooltip: React.FC<ChartTooltipProps> = ({ content: Content = ChartTooltipContent, ...props }) => {
  return <Content {...props} />
}

export { ChartContainer, ChartTooltip, ChartTooltipContent }