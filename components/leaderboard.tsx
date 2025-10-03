"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrophyIcon, MedalIcon, AwardIcon } from "lucide-react"
import { DashboardData } from "@/lib/types"
import { calculateLeaderboard } from "@/lib/data-utils"

interface LeaderboardProps {
  data: DashboardData | null
}

export function Leaderboard({ data }: LeaderboardProps) {
  const leaderboard = calculateLeaderboard(data)

  console.log("[v0] Leaderboard data:", leaderboard)

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <TrophyIcon className="h-4 w-4 text-yellow-500" />
      case 2:
        return <MedalIcon className="h-4 w-4 text-gray-400" />
      case 3:
        return <AwardIcon className="h-4 w-4 text-amber-600" />
      default:
        return <span className="text-sm font-medium text-muted-foreground">#{rank}</span>
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case 2:
        return "bg-gray-400/10 text-gray-400 border-gray-400/20"
      case 3:
        return "bg-amber-600/10 text-amber-600 border-amber-600/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card className="">
      <CardHeader className="pb-3 px-3 sm:px-6 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrophyIcon className="h-5 w-5 text-primary" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 px-3 sm:px-6 sm:space-y-3">
        {leaderboard.map((member: any) => (
          <div
            key={member.email}
            className="flex items-center p-2 sm:p-3 rounded-lg bg-muted/30 border border-border/50 justify-between px-1.5"
          >
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div
                className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full flex-shrink-0 ${getRankColor(member.rank)}`}
              >
                {getRankIcon(member.rank)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-medium text-foreground truncate text-sm sm:text-base my-0 mx-0">{member.name}</div>
                <div className="text-xs text-muted-foreground">{member.avgPerDay}/day</div>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
              <div className="font-bold text-foreground text-sm sm:text-base">{member.beers}</div>
              <div className="text-xs text-muted-foreground">{member.liters}L</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
