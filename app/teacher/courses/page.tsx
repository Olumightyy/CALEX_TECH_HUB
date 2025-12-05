import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { BookOpen, Users, PlusCircle, MoreVertical, Edit, Eye, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default async function TeacherCoursesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: courses } = await supabase
    .from("courses")
    .select(`
      *,
      enrollments(count),
      modules(count),
      categories(name)
    `)
    .eq("teacher_id", user?.id)
    .order("created_at", { ascending: false })

  const allCourses = courses || []
  const publishedCourses = allCourses.filter((c) => c.status === "published")
  const draftCourses = allCourses.filter((c) => c.status === "draft")
  const pendingCourses = allCourses.filter((c) => c.status === "pending_review")
  const rejectedCourses = allCourses.filter((c) => c.status === "rejected")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-emerald-100 text-emerald-700 text-xs">Published</Badge>
      case "pending_review":
        return <Badge className="bg-amber-100 text-amber-700 text-xs">Pending</Badge>
      case "draft":
        return (
          <Badge variant="secondary" className="text-xs">
            Draft
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive" className="text-xs">
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        )
    }
  }

  const CourseList = ({ courseList }: { courseList: typeof allCourses }) => (
    <div className="space-y-3 sm:space-y-4">
      {courseList.length > 0 ? (
        courseList.map((course) => (
          <div
            key={course.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url || "/placeholder.svg"}
                  alt={course.title}
                  className="w-16 h-12 sm:w-24 sm:h-16 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-12 sm:w-24 sm:h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">{course.title}</h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-muted-foreground">
                  <span className="truncate">{course.categories?.name || "Uncategorized"}</span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {course.enrollments?.[0]?.count || 0}
                  </span>
                  <span>{course.price === 0 ? "Free" : `₦${course.price.toLocaleString()}`}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
              {getStatusBadge(course.status)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/teacher/courses/${course.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Course
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/courses/${course.slug}`} target="_blank">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Link>
                  </DropdownMenuItem>
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
        <div className="text-center py-8 sm:py-12">
          <BookOpen className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 text-base sm:text-lg font-medium">No courses found</h3>
          <p className="mt-2 text-sm text-muted-foreground">Create your first course to get started</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">My Courses</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and organize all your courses</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
          <Link href="/teacher/courses/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-3 sm:p-6">
          <Tabs defaultValue="all" className="space-y-4 sm:space-y-6">
            <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
              <TabsList className="min-w-max">
                <TabsTrigger value="all" className="text-xs sm:text-sm">
                  All ({allCourses.length})
                </TabsTrigger>
                <TabsTrigger value="published" className="text-xs sm:text-sm">
                  Published ({publishedCourses.length})
                </TabsTrigger>
                <TabsTrigger value="drafts" className="text-xs sm:text-sm">
                  Drafts ({draftCourses.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="text-xs sm:text-sm">
                  Pending ({pendingCourses.length})
                </TabsTrigger>
                {rejectedCourses.length > 0 && (
                  <TabsTrigger value="rejected" className="text-xs sm:text-sm">
                    Rejected ({rejectedCourses.length})
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <TabsContent value="all">
              <CourseList courseList={allCourses} />
            </TabsContent>
            <TabsContent value="published">
              <CourseList courseList={publishedCourses} />
            </TabsContent>
            <TabsContent value="drafts">
              <CourseList courseList={draftCourses} />
            </TabsContent>
            <TabsContent value="pending">
              <CourseList courseList={pendingCourses} />
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
