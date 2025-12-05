import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { BookOpen, Users, Eye, MoreVertical, CheckCircle, XCircle, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default async function AdminCoursesPage() {
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from("courses")
    .select(`
      *,
      profiles(full_name),
      categories(name),
      enrollments(count)
    `)
    .order("created_at", { ascending: false })

  const allCourses = courses || []
  const publishedCourses = allCourses.filter((c) => c.status === "published")
  const pendingCourses = allCourses.filter((c) => c.status === "pending_review")
  const draftCourses = allCourses.filter((c) => c.status === "draft")
  const rejectedCourses = allCourses.filter((c) => c.status === "rejected")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-emerald-100 text-emerald-700">Published</Badge>
      case "pending_review":
        return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const CourseList = ({ courseList }: { courseList: typeof allCourses }) => (
    <div className="space-y-4">
      {courseList.length > 0 ? (
        courseList.map((course) => (
          <div
            key={course.id}
            className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url || "/placeholder.svg"}
                  alt={course.title}
                  className="w-24 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-24 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-foreground">{course.title}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span>by {course.profiles?.full_name || "Unknown"}</span>
                  <span>{course.categories?.name || "Uncategorized"}</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {course.enrollments?.[0]?.count || 0}
                  </span>
                  <span>${course.price || 0}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(course.status)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/courses/${course.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Review
                    </Link>
                  </DropdownMenuItem>
                  {course.status === "pending_review" && (
                    <>
                      <DropdownMenuItem className="text-emerald-600">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No courses found</h3>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Course Management</h1>
        <p className="text-muted-foreground mt-1">Review, approve, and manage all platform courses</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All ({allCourses.length})</TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                Pending ({pendingCourses.length})
                {pendingCourses.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="published">Published ({publishedCourses.length})</TabsTrigger>
              <TabsTrigger value="drafts">Drafts ({draftCourses.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({rejectedCourses.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <CourseList courseList={allCourses} />
            </TabsContent>
            <TabsContent value="pending">
              <CourseList courseList={pendingCourses} />
            </TabsContent>
            <TabsContent value="published">
              <CourseList courseList={publishedCourses} />
            </TabsContent>
            <TabsContent value="drafts">
              <CourseList courseList={draftCourses} />
            </TabsContent>
            <TabsContent value="rejected">
              <CourseList courseList={rejectedCourses} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
