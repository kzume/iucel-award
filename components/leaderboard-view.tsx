"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Medal, Trophy } from "lucide-react"

type Category = {
  id: string
  name: string
}

type LeaderboardEntry = {
  participant_id: string
  participant_name: string
  total_score: number
  max_score: number
  percentage: number
  criteria_scores: {
    criterion_name: string
    score: number
    max_points: number
  }[]
}

interface LeaderboardViewProps {
  categories: Category[]
}

export function LeaderboardView({ categories }: LeaderboardViewProps) {
  const [selectedCategory, setSelectedCategory] = useState("")
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (selectedCategory) {
      loadLeaderboard(selectedCategory)
    } else {
      setLeaderboard([])
    }
  }, [selectedCategory])

  const loadLeaderboard = async (categoryId: string) => {
    setIsLoading(true)

    try {
      // Get all participants in this category
      const { data: participants } = await supabase
        .from("participants")
        .select("id, name")
        .eq("category_id", categoryId)

      // Get all criteria for this category
      const { data: criteria } = await supabase
        .from("criteria")
        .select("id, name, max_points")
        .eq("category_id", categoryId)
        .order("display_order")

      if (!participants || !criteria) {
        setLeaderboard([])
        return
      }

      // Calculate scores for each participant
      const entries: LeaderboardEntry[] = []

      for (const participant of participants) {
        const criteriaScores = []
        let totalScore = 0
        let maxScore = 0

        for (const criterion of criteria) {
          // Get average score for this participant and criterion
          const { data: marks } = await supabase
            .from("marks")
            .select("points")
            .eq("participant_id", participant.id)
            .eq("criterion_id", criterion.id)

          const avgScore =
            marks && marks.length > 0
              ? marks.reduce((sum, m) => sum + Number.parseFloat(m.points.toString()), 0) / marks.length
              : 0

          criteriaScores.push({
            criterion_name: criterion.name,
            score: avgScore,
            max_points: criterion.max_points,
          })

          totalScore += avgScore
          maxScore += criterion.max_points
        }

        entries.push({
          participant_id: participant.id,
          participant_name: participant.name,
          total_score: totalScore,
          max_score: maxScore,
          percentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
          criteria_scores: criteriaScores,
        })
      }

      // Sort by total score descending
      entries.sort((a, b) => b.total_score - a.total_score)

      setLeaderboard(entries)
    } catch (error) {
      console.error("Error loading leaderboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />
    return null
  }

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Category</CardTitle>
          <CardDescription>Choose an award category to view rankings</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      {selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Rankings</CardTitle>
            <CardDescription>Scores are averaged across all jury members</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : leaderboard.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No scores yet for this category</p>
            ) : (
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.participant_id}
                    className={`p-4 border rounded-lg ${index === 0 ? "border-primary bg-primary/5" : "bg-card"}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-sm font-bold">
                          {getRankIcon(index) || index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{entry.participant_name}</h3>
                          <p className="text-sm text-muted-foreground">{entry.percentage.toFixed(1)}% overall</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{entry.total_score.toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">/ {entry.max_score}</div>
                      </div>
                    </div>

                    {/* Criteria Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3 pt-3 border-t">
                      {entry.criteria_scores.map((cs, idx) => (
                        <div key={idx} className="text-sm">
                          <div className="text-muted-foreground truncate">{cs.criterion_name}</div>
                          <div className="font-medium">
                            {cs.score.toFixed(1)} / {cs.max_points}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
