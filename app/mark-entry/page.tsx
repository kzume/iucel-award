import { createClient } from "@/lib/supabase/server"
import { MarkEntryForm } from "@/components/mark-entry-form"
import { Trophy } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function MarkEntryPage() {
  const supabase = await createClient()

  // Fetch categories
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <Trophy className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Mark Entry</h1>
              <p className="text-muted-foreground">Enter scores for participants in the competition</p>
            </div>
          </div>

          {/* Mark Entry Form */}
          <MarkEntryForm categories={categories || []} />
        </div>
      </div>
    </div>
  )
}
