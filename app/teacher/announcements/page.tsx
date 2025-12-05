import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Megaphone, Plus, Calendar, Eye } from "lucide-react"

export default async function TeacherAnnouncementsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: announcements } = await supabase
    .from("announcements")
    .select(`
      *,
      courses(title)
    `)
    .eq("teacher_id", user?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
          <p className="text-muted-foreground mt-1">Communicate with your students</p>
        </div>
        <Button className="rounded-xl shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" />
          New Announcement
        </Button>
      </div>

      {/* Create Announcement Form */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Create Announcement</CardTitle>
          <CardDescription>Share updates and news with your students</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Announcement title..." className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Write your announcement message..." className="mt-1.5 min-h-32" />
            </div>
            <div>
              <Label htmlFor="course">Target Course (Optional)</Label>
              <select id="course" className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2">
                <option value="">All students</option>
                <option value="course1">Course 1</option>
                <option value="course2">Course 2</option>
              </select>
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              <Megaphone className="mr-2 h-4 w-4" />
              Publish Announcement
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Past Announcements */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Previous Announcements</CardTitle>
          <CardDescription>View your announcement history</CardDescription>
        </CardHeader>
        <CardContent>
          {announcements && announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Megaphone className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{announcement.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{announcement.message}</p>
                      </div>
                      <Badge variant="outline">{announcement.courses?.title || "All Students"}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(announcement.created_at).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {Math.floor(Math.random() * 100)} views
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <Megaphone className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No announcements yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first announcement to communicate with students
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
