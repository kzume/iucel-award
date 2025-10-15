"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type Category = {
  id: string
  name: string
  description: string | null
}

interface CategoriesTabProps {
  categories: Category[]
}

export function CategoriesTab({ categories }: CategoriesTabProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("categories").insert({
        name,
        description: description || null,
      })

      if (error) throw error

      setName("")
      setDescription("")
      router.refresh()
    } catch (error) {
      console.error("Error adding category:", error)
      alert("Failed to add category")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete all associated criteria and participants.")) {
      return
    }

    try {
      const { error } = await supabase.from("categories").delete().eq("id", id)
      if (error) throw error
      router.refresh()
    } catch (error) {
      console.error("Error deleting category:", error)
      alert("Failed to delete category")
    }
  }

  return (
    <div className="space-y-6">
      {/* Add New Category */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
          <CardDescription>Create a new award category for the competition</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Best Innovative Project"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Categories ({categories.length})</CardTitle>
          <CardDescription>Manage award categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No categories yet. Add your first category above.
              </p>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="flex items-start justify-between p-4 border rounded-lg bg-card">
                  <div className="flex-1">
                    <h3 className="font-semibold">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(category.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
