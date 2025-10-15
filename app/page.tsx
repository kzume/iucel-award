import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, ClipboardList, BarChart3, Settings } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-3 text-balance">IUCEL Competition Jury System</h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Professional marking and evaluation platform for competition judges
            </p>
          </div>

          {/* Navigation Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/mark-entry">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ClipboardList className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>Mark Entry</CardTitle>
                  </div>
                  <CardDescription>
                    Enter scores for participants across different award categories and criteria
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Start Marking</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/leaderboard">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <BarChart3 className="h-6 w-6 text-accent" />
                    </div>
                    <CardTitle>Leaderboard</CardTitle>
                  </div>
                  <CardDescription>View rankings and scores for all participants by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full bg-transparent">
                    View Rankings
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-secondary">
                      <Settings className="h-6 w-6 text-foreground" />
                    </div>
                    <CardTitle>Admin Setup</CardTitle>
                  </div>
                  <CardDescription>Manage categories, criteria, and participants for the competition</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="secondary" className="w-full">
                    Manage Setup
                  </Button>
                </CardContent>
              </Card>
            </Link>

            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Competition Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Award Categories:</span>
                  <span className="text-foreground font-medium">4</span>
                </div>
                <div className="flex justify-between">
                  <span>Criteria per Category:</span>
                  <span className="text-foreground font-medium">6</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Points per Criterion:</span>
                  <span className="text-foreground font-medium">10</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
