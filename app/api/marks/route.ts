import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams
  const juryId = searchParams.get("juryId")
  const participantId = searchParams.get("participantId")

  let query = supabase.from("marks").select("*")

  if (juryId) {
    query = query.eq("jury_id", juryId)
  }

  if (participantId) {
    query = query.eq("participant_id", participantId)
  }

  const { data: marks } = await query
  return NextResponse.json(marks || [])
}
