import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams
  const categoryId = searchParams.get("categoryId")

  if (!categoryId) {
    return NextResponse.json([])
  }

  // Fetch participants in this category
  const { data: participants } = await supabase
    .from("participants")
    .select("*")
    .eq("category_id", categoryId)
    .order("name")

  if (!participants) {
    return NextResponse.json([])
  }

  // Fetch all marks for these participants
  const participantIds = participants.map((p) => p.id)
  const { data: marks } = await supabase
    .from("marks")
    .select("*, jury(name), criteria(name, max_points)")
    .in("participant_id", participantIds)

  // Calculate scores for each participant
  const leaderboard = participants.map((participant) => {
    const participantMarks = marks?.filter((m) => m.participant_id === participant.id) || []

    // Group marks by jury
    const juryMarks = new Map()
    participantMarks.forEach((mark) => {
      if (!juryMarks.has(mark.jury_id)) {
        juryMarks.set(mark.jury_id, [])
      }
      juryMarks.get(mark.jury_id).push(mark)
    })

    // Calculate average score from each jury
    let totalScore = 0
    let juryCount = 0

    juryMarks.forEach((marks) => {
      const juryTotal = marks.reduce((sum: number, mark: any) => sum + mark.points, 0)
      totalScore += juryTotal
      juryCount++
    })

    const averageScore = juryCount > 0 ? totalScore / juryCount : 0

    return {
      ...participant,
      score: averageScore,
      juryCount,
      marks: participantMarks,
    }
  })

  // Sort by score descending
  leaderboard.sort((a, b) => b.score - a.score)

  return NextResponse.json(leaderboard)
}
