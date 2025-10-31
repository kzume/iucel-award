import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const [categoriesResult, criteriaResult, participantsResult, juryResult] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("criteria").select("*, categories(name)").order("display_order"),
    supabase.from("participants").select("*, categories(name)").order("name"),
    supabase.from("jury").select("*").order("name"),
  ])

  return NextResponse.json({
    categories: categoriesResult.data || [],
    criteria: criteriaResult.data || [],
    participants: participantsResult.data || [],
    jury: juryResult.data || [],
  })
}
