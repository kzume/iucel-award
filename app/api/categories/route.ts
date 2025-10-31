import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from("categories").select("*").order("name")
  return NextResponse.json(categories || [])
}
