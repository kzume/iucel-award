"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoriesTab } from "@/components/admin/categories-tab"
import { CriteriaTab } from "@/components/admin/criteria-tab"
import { ParticipantsTab } from "@/components/admin/participants-tab"

type Category = {
  id: string
  name: string
  description: string | null
}

type Criterion = {
  id: string
  category_id: string
  name: string
  max_points: number
  display_order: number
  categories: { name: string } | null
}

type Participant = {
  id: string
  name: string
  category_id: string
  categories: { name: string } | null
}

interface AdminTabsProps {
  categories: Category[]
  criteria: Criterion[]
  participants: Participant[]
}

export function AdminTabs({ categories, criteria, participants }: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState("categories")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="criteria">Criteria</TabsTrigger>
        <TabsTrigger value="participants">Participants</TabsTrigger>
      </TabsList>

      <TabsContent value="categories" className="mt-6">
        <CategoriesTab categories={categories} />
      </TabsContent>

      <TabsContent value="criteria" className="mt-6">
        <CriteriaTab criteria={criteria} categories={categories} />
      </TabsContent>

      <TabsContent value="participants" className="mt-6">
        <ParticipantsTab participants={participants} categories={categories} />
      </TabsContent>
    </Tabs>
  )
}
