import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()
  const { data: jury } = await supabase.from("jury").select("*").order("name")
  return NextResponse.json(jury || [])
}
