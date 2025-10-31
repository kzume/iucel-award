import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams
  const categoryId = searchParams.get("categoryId")

  let query = supabase.from("participants").select("*").order("name")

  if (categoryId) {
    query = query.eq("category_id", categoryId)
  }

  const { data: participants } = await query
  return NextResponse.json(participants || [])
}
