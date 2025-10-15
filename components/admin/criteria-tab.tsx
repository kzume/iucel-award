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

type Criterion = {
  id: string
  category_id: string
  name: string
  max_points: number
  display_order: number
  categories: { name: string } | null
}

interface CriteriaTabProps {
  criteria: Criterion[]
  categories: Category[]
}

export function CriteriaTab({ criteria, categories }: CriteriaTabProps) {
  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [maxPoints, setMaxPoints] = useState("10")
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
      // Get the highest display order for this category
      const { data: existingCriteria } = await supabase
        .from("criteria")
        .select("display_order")
        .eq("category_id", categoryId)
        .order("display_order", { ascending: false })
        .limit(1)

      const nextOrder = existingCriteria && existingCriteria.length > 0 ? existingCriteria[0].display_order + 1 : 1

      const { error } = await supabase.from("criteria").insert({
        name,
        category_id: categoryId,
        max_points: Number.parseInt(maxPoints),
        display_order: nextOrder,
      })

      if (error) throw error

      setName("")
      setCategoryId("")
      setMaxPoints("10")
      router.refresh()
    } catch (error) {
      console.error("Error adding criterion:", error)
      alert("Failed to add criterion")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete all marks for this criterion.")) {
      return
    }

    try {
      const { error } = await supabase.from("criteria").delete().eq("id", id)
      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error deleting criterion:", error)
      alert("Failed to delete criterion")
    }
  }

  // Group criteria by category
  const criteriaByCategory = criteria.reduce(
    (acc, criterion) => {
      const categoryName = criterion.categories?.name || "Unknown"
      if (!acc[categoryName]) {
        acc[categoryName] = []
      }
      acc[categoryName].push(criterion)
      return acc
    },
    {} as Record<string, Criterion[]>,
  )

  return (
    <div className="space-y-6">
      {/* Add New Criterion */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Criterion</CardTitle>
          <CardDescription>Create a new evaluation criterion for a category</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
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
            <div className="space-y-2">
              <Label htmlFor="criterion-name">Criterion Name</Label>
              <Input
                id="criterion-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Code Quality"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-points">Max Points</Label>
              <Input
                id="max-points"
                type="number"
                min="1"
                max="100"
                value={maxPoints}
                onChange={(e) => setMaxPoints(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isLoading || categories.length === 0}>
              <Plus className="h-4 w-4 mr-2" />
              Add Criterion
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Criteria */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Criteria ({criteria.length})</CardTitle>
          <CardDescription>Manage evaluation criteria by category</CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(criteriaByCategory).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No criteria yet. Add your first criterion above.
            </p>
          ) : (
            <div className="space-y-6">
              {Object.entries(criteriaByCategory).map(([categoryName, categoryCriteria]) => (
                <div key={categoryName}>
                  <h3 className="font-semibold mb-3 text-primary">{categoryName}</h3>
                  <div className="space-y-2">
                    {categoryCriteria.map((criterion) => (
                      <div
                        key={criterion.id}
                        className="flex items-center justify-between p-3 border rounded-lg bg-card"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">#{criterion.display_order}</span>
                          <span className="font-medium">{criterion.name}</span>
                          <span className="text-sm text-muted-foreground">(Max: {criterion.max_points} pts)</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(criterion.id)}
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
