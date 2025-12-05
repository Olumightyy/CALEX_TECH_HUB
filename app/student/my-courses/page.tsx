import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CourseCard } from "@/components/courses/course-card"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowRight } from "lucide-react"

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

  const activeEnrollments = enrollments.filter((e) => e.status === "active")
  const completedEnrollments = enrollments.filter((e) => e.status === "completed")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">Manage your enrolled courses and track your progress.</p>
        </div>
        <Button asChild>
          <Link href="/courses">
            Browse Courses
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">In Progress ({activeEnrollments.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedEnrollments.length})</TabsTrigger>
          <TabsTrigger value="all">All ({enrollments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeEnrollments.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

        <TabsContent value="completed" className="mt-6">
          {completedEnrollments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No completed courses yet</h3>
              <p className="text-muted-foreground">Keep learning to complete your first course!</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {completedEnrollments.map((enrollment) => (
                <CourseCard key={enrollment.id} course={enrollment.course} showProgress progress={100} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {enrollments.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {enrollments.map((enrollment) => (
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
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="mb-2 text-lg font-semibold">No courses yet</h3>
      <p className="mb-4 text-muted-foreground">Start your learning journey by enrolling in a course.</p>
      <Button asChild>
        <Link href="/courses">Browse Courses</Link>
      </Button>
    </div>
  )
}
