"use client"

import { AdminTabs } from "@/components/admin-tabs"
import { Trophy } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function AdminPage() {
  const { data, isLoading } = useSWR("/api/admin", fetcher, {
    refreshInterval: 3000, // Auto-refresh every 3 seconds
    revalidateOnFocus: true,
  })

  const categories = data?.categories || []
  const criteria = data?.criteria || []
  const participants = data?.participants || []
  const jury = data?.jury || []

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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Live
            </div>
          </div>

          {isLoading && !data ? (
            <div className="text-center py-12 text-muted-foreground">Loading...</div>
          ) : (
            <AdminTabs categories={categories} criteria={criteria} participants={participants} jury={jury} />
          )}
        </div>
      </div>
    </div>
  )
}
