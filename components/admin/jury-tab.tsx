"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type Jury = {
  id: string
  name: string
  created_at: string
}

interface JuryTabProps {
  jury: Jury[]
}

export function JuryTab({ jury }: JuryTabProps) {
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)

    try {
      const { error } = await supabase.from("jury").insert({
        name,
      })

      if (error) throw error

      setName("")
      router.refresh()
    } catch (error) {
      console.error("Error adding jury member:", error)
      alert("Failed to add jury member")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete all marks from this jury member.")) {
      return
    }

    try {
      const { error } = await supabase.from("jury").delete().eq("id", id)
      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error deleting jury member:", error)
      alert("Failed to delete jury member")
    }
  }

  return (
    <div className="space-y-6">
      {/* Add New Jury Member */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Jury Member</CardTitle>
          <CardDescription>Register a new jury member for the competition</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jury-name">Jury Member Name</Label>
              <Input
                id="jury-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="name"
                required
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Jury Member
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Jury Members */}
      <Card>
        <CardHeader>
          <CardTitle>Jury Members ({jury.length})</CardTitle>
          <CardDescription>Manage registered jury members</CardDescription>
        </CardHeader>
        <CardContent>
          {jury.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No jury members yet. Add your first jury member above.
            </p>
          ) : (
            <div className="space-y-2">
              {jury.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  <span className="font-medium">{member.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(member.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
