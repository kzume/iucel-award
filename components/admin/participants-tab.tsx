"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type Category = {
  id: string
  name: string
}

type Participant = {
  id: string
  name: string
  category_id: string
  categories: { name: string } | null
}

interface ParticipantsTabProps {
  participants: Participant[]
  categories: Category[]
}

export function ParticipantsTab({ participants, categories }: ParticipantsTabProps) {
  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId) {
      alert("Please select a category")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.from("participants").insert({
        name,
        category_id: categoryId,
      })

      if (error) throw error

      setName("")
      setCategoryId("")
      router.refresh()
    } catch (error) {
      console.error("Error adding participant:", error)
      alert("Failed to add participant")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete all marks for this participant.")) {
      return
    }

    try {
      const { error } = await supabase.from("participants").delete().eq("id", id)
      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error deleting participant:", error)
      alert("Failed to delete participant")
    }
  }

  // Group participants by category
  const participantsByCategory = participants.reduce(
    (acc, participant) => {
      const categoryName = participant.categories?.name || "Unknown"
      if (!acc[categoryName]) {
        acc[categoryName] = []
      }
      acc[categoryName].push(participant)
      return acc
    },
    {} as Record<string, Participant[]>,
  )

  return (
    <div className="space-y-6">
      {/* Add New Participant */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Participant</CardTitle>
          <CardDescription>Register a new participant for a category</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="participant-name">Participant Name</Label>
              <Input
                id="participant-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Team Alpha"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="participant-category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isLoading || categories.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add Participant
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Participants */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Participants ({participants.length})</CardTitle>
          <CardDescription>Manage registered participants by category</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(participantsByCategory).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No participants yet. Add your first participant above.
            </p>
          ) : (
            <div className="space-y-6">
              {Object.entries(participantsByCategory).map(([categoryName, categoryParticipants]) => (
                <div key={categoryName}>
                  <h3 className="font-semibold mb-3 text-primary">
                    {categoryName} ({categoryParticipants.length})
                  </h3>
                  <div className="space-y-2">
                    {categoryParticipants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-card"
                      >
                        <span className="font-medium">{participant.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(participant.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
