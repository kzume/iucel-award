import { createClient } from "@/lib/supabase/server"
import { AdminTabs } from "@/components/admin-tabs"
import { Trophy } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminPage() {
  const supabase = await createClient()

  const [categoriesResult, criteriaResult, participantsResult, juryResult] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("criteria").select("*, categories(name)").order("display_order"),
    supabase.from("participants").select("*, categories(name)").order("name"),
    supabase.from("jury").select("*").order("name"),
  ])

  const categories = categoriesResult.data || []
  const criteria = criteriaResult.data || []
  const participants = participantsResult.data || []
  const jury = juryResult.data || []

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <Trophy className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">Admin Setup</h1>
                <p className="text-muted-foreground">Manage competition categories, criteria, and participants</p>
              </div>
            </div>
          </div>

          <AdminTabs categories={categories} criteria={criteria} participants={participants} jury={jury} />
        </div>
      </div>
    </div>
  )
}
