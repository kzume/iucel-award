"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Save, CheckCircle2, AlertCircle, ArrowLeft, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

type Category = {
  id: string
  name: string
}

type Participant = {
  id: string
  name: string
  institution: string | null
}

type Criterion = {
  id: string
  name: string
  max_points: number
  display_order: number
}

type Mark = {
  criterion_id: string
  points: string
}

type Jury = {
  id: string
  name: string
}

type ComparisonMark = {
  participant_id: string
  participant_name: string
  criterion_id: string
  points: number
}

interface MarkEntryFormProps {
  categories: Category[]
}

export function MarkEntryForm({ categories }: MarkEntryFormProps) {
  const [juryName, setJuryName] = useState("")
  const [juryList, setJuryList] = useState<Jury[]>([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedParticipant, setSelectedParticipant] = useState("")
  const [participants, setParticipants] = useState<Participant[]>([])
  const [unmarkedParticipants, setUnmarkedParticipants] = useState<Set<string>>(new Set())
  const [criteria, setCriteria] = useState<Criterion[]>([])
  const [marks, setMarks] = useState<Mark[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const supabase = createClient()

  const [comparisonParticipants, setComparisonParticipants] = useState<string[]>([])
  const [comparisonMarks, setComparisonMarks] = useState<ComparisonMark[]>([])
  const [showComparison, setShowComparison] = useState(false)

  useEffect(() => {
    const savedJuryName = localStorage.getItem("iucel_jury_name")
    if (savedJuryName) {
      setJuryName(savedJuryName)
    }
    loadJuryList()
  }, [])

  useEffect(() => {
    if (juryName) {
      localStorage.setItem("iucel_jury_name", juryName)
    }
  }, [juryName])

  const loadJuryList = async () => {
    const { data } = await supabase.from("jury").select("*").order("name")
    setJuryList(data || [])
  }

  // Load participants when category changes
  useEffect(() => {
    if (selectedCategory) {
      loadParticipants(selectedCategory)
      loadCriteria(selectedCategory)
    } else {
      setParticipants([])
      setCriteria([])
    }
    setSelectedParticipant("")
    setMarks([])
  }, [selectedCategory])

  useEffect(() => {
    if (selectedCategory && juryName) {
      loadUnmarkedParticipants(selectedCategory, juryName)
    }
  }, [selectedCategory, juryName])

  // Load existing marks when participant changes
  useEffect(() => {
    if (selectedParticipant && juryName) {
      loadExistingMarks()
    }
  }, [selectedParticipant, juryName])

  useEffect(() => {
    if (comparisonParticipants.length > 0 && juryName && selectedCategory) {
      loadComparisonMarks()
    } else {
      setComparisonMarks([])
    }
  }, [comparisonParticipants, juryName, selectedCategory])

  const loadParticipants = async (categoryId: string) => {
    const { data } = await supabase
      .from("participants")
      .select("id, name, institution")
      .eq("category_id", categoryId)
      .order("name")
    setParticipants(data || [])
  }

  const loadUnmarkedParticipants = async (categoryId: string, jury: string) => {
    // Get all participants in this category
    const { data: allParticipants } = await supabase.from("participants").select("id").eq("category_id", categoryId)

    if (!allParticipants) return

    // Get all criteria for this category
    const { data: allCriteria } = await supabase.from("criteria").select("id").eq("category_id", categoryId)

    if (!allCriteria || allCriteria.length === 0) return

    const unmarked = new Set<string>()

    // Check each participant to see if all criteria have been marked by this jury
    for (const participant of allParticipants) {
      const { data: marks } = await supabase
        .from("marks")
        .select("criterion_id")
        .eq("participant_id", participant.id)
        .eq("jury_member_name", jury)

      // If not all criteria are marked, add to unmarked set
      if (!marks || marks.length < allCriteria.length) {
        unmarked.add(participant.id)
      }
    }

    setUnmarkedParticipants(unmarked)
  }

  const loadCriteria = async (categoryId: string) => {
    const { data } = await supabase
      .from("criteria")
      .select("id, name, max_points, display_order")
      .eq("category_id", categoryId)
      .order("display_order")

    setCriteria(data || [])

    // Initialize marks array
    if (data) {
      setMarks(data.map((c) => ({ criterion_id: c.id, points: "" })))
    }
  }

  const loadExistingMarks = async () => {
    const { data } = await supabase
      .from("marks")
      .select("criterion_id, points")
      .eq("participant_id", selectedParticipant)
      .eq("jury_member_name", juryName)

    if (data && data.length > 0) {
      setMarks((prevMarks) =>
        prevMarks.map((mark) => {
          const existing = data.find((d) => d.criterion_id === mark.criterion_id)
          return existing ? { ...mark, points: existing.points.toString() } : mark
        }),
      )
    }
  }

  const loadComparisonMarks = async () => {
    if (comparisonParticipants.length === 0) return

    const { data } = await supabase
      .from("marks")
      .select("participant_id, criterion_id, points, participants(name)")
      .in("participant_id", comparisonParticipants)
      .eq("jury_member_name", juryName)

    if (data) {
      const formattedMarks: ComparisonMark[] = data.map((mark: any) => ({
        participant_id: mark.participant_id,
        participant_name: mark.participants?.name || "Unknown",
        criterion_id: mark.criterion_id,
        points: mark.points,
      }))
      setComparisonMarks(formattedMarks)
    }
  }

  const handleMarkChange = (criterionId: string, value: string) => {
    setMarks((prevMarks) =>
      prevMarks.map((mark) => (mark.criterion_id === criterionId ? { ...mark, points: value } : mark)),
    )
    setIsSaved(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!juryName || !selectedParticipant) {
      alert("Please fill in all required fields")
      return
    }

    // Validate all marks are entered
    const invalidMarks = marks.filter((m) => !m.points || Number.parseFloat(m.points) < 0)
    if (invalidMarks.length > 0) {
      alert("Please enter valid scores for all criteria")
      return
    }

    setIsLoading(true)

    try {
      // Upsert marks (insert or update if exists)
      const marksToSave = marks.map((mark) => ({
        participant_id: selectedParticipant,
        criterion_id: mark.criterion_id,
        jury_member_name: juryName,
        points: Number.parseFloat(mark.points),
      }))

      for (const mark of marksToSave) {
        const { error } = await supabase.from("marks").upsert(mark, {
          onConflict: "participant_id,criterion_id,jury_member_name",
        })

        if (error) throw error
      }

      setIsSaved(true)

      if (selectedCategory) {
        await loadUnmarkedParticipants(selectedCategory, juryName)
      }

      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error("Error saving marks:", error)
      alert("Failed to save marks")
    } finally {
      setIsLoading(false)
    }
  }

  const getTotalScore = () => {
    return marks.reduce((sum, mark) => sum + (Number.parseFloat(mark.points) || 0), 0)
  }

  const getMaxTotalScore = () => {
    return criteria.reduce((sum, criterion) => sum + criterion.max_points, 0)
  }

  const isParticipantMarked = (participantId: string) => {
    return !unmarkedParticipants.has(participantId)
  }

  const toggleComparisonParticipant = (participantId: string) => {
    setComparisonParticipants((prev) =>
      prev.includes(participantId) ? prev.filter((id) => id !== participantId) : [...prev, participantId],
    )
  }

  const getComparisonMark = (participantId: string, criterionId: string) => {
    const mark = comparisonMarks.find((m) => m.participant_id === participantId && m.criterion_id === criterionId)
    return mark?.points
  }

  const handleBack = () => {
    setSelectedCategory("")
    setSelectedParticipant("")
    setMarks([])
    setCriteria([])
    setParticipants([])
    setUnmarkedParticipants(new Set())
    setIsSaved(false)
    setComparisonParticipants([])
    setComparisonMarks([])
    setShowComparison(false)
    // Note: juryName is preserved in localStorage and state
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter Marks</CardTitle>
        <CardDescription>Select your name, category, and participant to enter scores</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="jury-name">Your Name (Jury Member)</Label>
            <Select value={juryName} onValueChange={setJuryName} required>
              <SelectTrigger>
                <SelectValue placeholder="Select your name" />
              </SelectTrigger>
              <SelectContent>
                {juryList.map((jury) => (
                  <SelectItem key={jury.id} value={jury.name}>
                    {jury.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {juryName && (
              <p className="text-xs text-muted-foreground">Your name is saved. You can change it anytime.</p>
            )}
          </div>

          {/* Category Selection */}
          {juryName && (
            <div className="space-y-2">
              <Label htmlFor="category">Award Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
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
          )}

          {selectedCategory && juryName && (
            <div className="space-y-2">
              <Label htmlFor="participant">Participant</Label>
              <Select value={selectedParticipant} onValueChange={setSelectedParticipant} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a participant" />
                </SelectTrigger>
                <SelectContent>
                  {participants.map((participant) => (
                    <SelectItem key={participant.id} value={participant.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{participant.name}</span>
                        {isParticipantMarked(participant.id) ? (
                          <Badge variant="secondary" className="ml-2">
                            Marked
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="ml-2">
                            Not Marked
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {unmarkedParticipants.size > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>You have {unmarkedParticipants.size} unmarked participant(s) in this category</span>
                </div>
              )}
            </div>
          )}

          {/* Criteria Scoring */}
          {selectedParticipant && criteria.length > 0 && (
            <>
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Compare with Other Participants
                  </h3>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowComparison(!showComparison)}>
                    {showComparison ? "Hide" : "Show"} Comparison
                  </Button>
                </div>

                {showComparison && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {participants
                        .filter((p) => p.id !== selectedParticipant && isParticipantMarked(p.id))
                        .map((participant) => (
                          <div key={participant.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`compare-${participant.id}`}
                              checked={comparisonParticipants.includes(participant.id)}
                              onCheckedChange={() => toggleComparisonParticipant(participant.id)}
                            />
                            <label
                              htmlFor={`compare-${participant.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {participant.name}
                            </label>
                          </div>
                        ))}
                    </div>

                    {comparisonParticipants.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        Select participants to compare marks
                      </p>
                    )}

                    {comparisonParticipants.length > 0 && comparisonMarks.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        No marks found for selected participants
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-4">Evaluation Criteria</h3>
                <div className="space-y-4">
                  {criteria.map((criterion, index) => {
                    const mark = marks.find((m) => m.criterion_id === criterion.id)
                    return (
                      <div key={criterion.id} className="space-y-2">
                        <Label htmlFor={`criterion-${criterion.id}`}>
                          {index + 1}. {criterion.name}
                          <span className="text-muted-foreground ml-2">(Max: {criterion.max_points} points)</span>
                        </Label>
                        <Input
                          id={`criterion-${criterion.id}`}
                          type="number"
                          min="0"
                          max={criterion.max_points}
                          step="0.5"
                          value={mark?.points || ""}
                          onChange={(e) => handleMarkChange(criterion.id, e.target.value)}
                          placeholder="0.0"
                          required
                        />

                        {showComparison && comparisonParticipants.length > 0 && (
                          <div className="ml-4 space-y-1">
                            {comparisonParticipants.map((participantId) => {
                              const participant = participants.find((p) => p.id === participantId)
                              const compMark = getComparisonMark(participantId, criterion.id)
                              return (
                                <div
                                  key={participantId}
                                  className="text-sm text-muted-foreground flex items-center gap-2"
                                >
                                  <span className="font-medium">{participant?.name}:</span>
                                  <span className="text-primary font-semibold">
                                    {compMark !== undefined ? compMark.toFixed(1) : "Not marked"}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Total Score */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Score:</span>
                  <span className="text-primary">
                    {getTotalScore().toFixed(1)} / {getMaxTotalScore()}
                  </span>
                </div>

                {showComparison && comparisonParticipants.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Comparison Totals:</p>
                    {comparisonParticipants.map((participantId) => {
                      const participant = participants.find((p) => p.id === participantId)
                      const total = criteria.reduce((sum, criterion) => {
                        const mark = getComparisonMark(participantId, criterion.id)
                        return sum + (mark || 0)
                      }, 0)
                      return (
                        <div key={participantId} className="flex justify-between items-center text-sm">
                          <span className="font-medium">{participant?.name}:</span>
                          <span className="text-primary font-semibold">
                            {total.toFixed(1)} / {getMaxTotalScore()}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1 bg-transparent">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    "Saving..."
                  ) : isSaved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Marks
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {selectedCategory && participants.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No participants found for this category. Please add participants in the Admin Setup.
            </p>
          )}

          {!juryName && (
            <p className="text-sm text-muted-foreground text-center py-4">Please select your name to continue.</p>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
