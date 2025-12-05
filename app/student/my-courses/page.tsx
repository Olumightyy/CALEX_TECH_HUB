import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CourseCard } from "@/components/courses/course-card"
import { Button } from "@/components/ui/button"
import { BookOpen, Search } from "lucide-react"

async function getEnrollments(userId: string) {
  const supabase = await createClient()

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      course:courses(
        *,
        teacher:profiles!teacher_id(id, full_name, avatar_url),
        category:categories(id, name, slug)
      )
    `)
    .eq("student_id", userId)
    .order("enrolled_at", { ascending: false })

  return enrollments || []
}

export default async function MyCoursesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const enrollments = await getEnrollments(user.id)

  const allEnrollments = enrollments || []
  const activeEnrollments = allEnrollments.filter((e) => e.status === "active")
  const completedEnrollments = allEnrollments.filter((e) => e.status === "completed")

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">My Courses</h1>
          <p className="text-sm text-muted-foreground sm:text-base">Manage your enrolled courses and track progress.</p>
        </div>
        <Button asChild size="sm" className="w-full sm:w-auto">
          <Link href="/courses">
            <Search className="mr-2 h-4 w-4" />
            Browse Courses
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
          <TabsList className="w-full sm:w-auto min-w-max">
            <TabsTrigger value="active" className="text-xs sm:text-sm">
              In Progress ({activeEnrollments.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm">
              Completed ({completedEnrollments.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All ({allEnrollments.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="active" className="mt-4 sm:mt-6">
          {activeEnrollments.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
              {activeEnrollments.map((enrollment) => (
                <CourseCard
                  key={enrollment.id}
                  course={enrollment.course}
                  showProgress
                  progress={enrollment.progress}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-4 sm:mt-6">
          {completedEnrollments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
              <BookOpen className="mb-4 h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
              <h3 className="mb-2 text-base sm:text-lg font-semibold">No completed courses yet</h3>
              <p className="text-sm text-muted-foreground">Keep learning to complete your first course!</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
              {completedEnrollments.map((enrollment) => (
                <CourseCard key={enrollment.id} course={enrollment.course} showProgress progress={100} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-4 sm:mt-6">
          {allEnrollments.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
              {allEnrollments.map((enrollment) => (
                <CourseCard
                  key={enrollment.id}
                  course={enrollment.course}
                  showProgress
                  progress={enrollment.progress}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
      <BookOpen className="mb-4 h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
      <h3 className="mb-2 text-base sm:text-lg font-semibold">No courses yet</h3>
      <p className="mb-4 text-sm text-muted-foreground max-w-xs">
        Start your learning journey by enrolling in a course.
      </p>
      <Button asChild>
        <Link href="/courses">Browse Courses</Link>
      </Button>
    </div>
  )
}
