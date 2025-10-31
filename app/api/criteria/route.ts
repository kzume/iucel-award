import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const searchParams = request.nextUrl.searchParams
  const categoryId = searchParams.get("categoryId")

  let query = supabase.from("criteria").select("*").order("display_order")

  if (categoryId) {
    query = query.eq("category_id", categoryId)
  }

  const { data: criteria } = await query
  return NextResponse.json(criteria || [])
}
