import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Award, Clock, TrendingUp, ArrowRight, Play } from "lucide-react"

async function getStudentData(userId: string) {
  const supabase = await createClient()

  // Get enrollments with course info
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      course:courses(
        id, title, slug, thumbnail_url, total_lessons,
        teacher:profiles!teacher_id(full_name)
      )
    `)
    .eq("student_id", userId)
    .eq("status", "active")
    .order("last_accessed_at", { ascending: false, nullsFirst: false })
    .limit(4)

  // Get certificates count
  const { count: certificatesCount } = await supabase
    .from("certificates")
    .select("id", { count: "exact" })
    .eq("student_id", userId)

  // Get completed courses
  const { count: completedCount } = await supabase
    .from("enrollments")
    .select("id", { count: "exact" })
    .eq("student_id", userId)
    .eq("status", "completed")

  // Calculate total learning time (from lesson progress)
  const { data: progressData } = await supabase.from("lesson_progress").select("watch_time").eq("student_id", userId)

  const totalWatchTime = progressData?.reduce((acc, p) => acc + (p.watch_time || 0), 0) || 0
  const totalHours = Math.floor(totalWatchTime / 3600)

  return {
    enrollments: enrollments || [],
    stats: {
      activeCourses: enrollments?.length || 0,
      completedCourses: completedCount || 0,
      certificates: certificatesCount || 0,
      learningHours: totalHours,
    },
  }
}

export default async function StudentDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { enrollments, stats } = await getStudentData(user.id)

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {profile?.full_name?.split(" ")[0] || "Student"}!</h1>
        <p className="mt-1 text-muted-foreground">Track your progress and continue learning.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCourses}</div>
            <p className="text-xs text-muted-foreground">Currently enrolled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
            <p className="text-xs text-muted-foreground">Courses finished</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certificates}</div>
            <p className="text-xs text-muted-foreground">Earned so far</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Learning Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.learningHours}h</div>
            <p className="text-xs text-muted-foreground">Total hours spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Continue Learning</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/student/my-courses">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {enrollments.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-12 text-center">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No courses yet</h3>
            <p className="mb-4 text-muted-foreground">Start your learning journey by enrolling in a course.</p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {enrollments.map(
              (enrollment: {
                id: string
                progress: number
                course: {
                  id: string
                  title: string
                  slug: string
                  thumbnail_url: string | null
                  total_lessons: number
                  teacher: { full_name: string | null }
                }
              }) => (
                <Link key={enrollment.id} href={`/student/courses/${enrollment.course.slug}`} className="group">
                  <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="flex">
                      <div className="relative h-32 w-40 flex-shrink-0 bg-muted">
                        <img
                          src={
                            enrollment.course.thumbnail_url ||
                            `/placeholder.svg?height=128&width=160&query=${encodeURIComponent(enrollment.course.title)}`
                          }
                          alt={enrollment.course.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <Play className="h-10 w-10 text-white" />
                        </div>
                      </div>
                      <CardContent className="flex flex-1 flex-col justify-between p-4">
                        <div>
                          <h3 className="mb-1 line-clamp-2 font-semibold group-hover:text-primary">
                            {enrollment.course.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">{enrollment.course.teacher?.full_name}</p>
                        </div>
                        <div className="mt-3">
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="h-2" />
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </Link>
              ),
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <Link href="/courses" className="block p-6">
            <BookOpen className="mb-3 h-8 w-8 text-primary" />
            <h3 className="mb-1 font-semibold">Browse Courses</h3>
            <p className="text-sm text-muted-foreground">Discover new courses to expand your skills.</p>
          </Link>
        </Card>
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <Link href="/student/certificates" className="block p-6">
            <Award className="mb-3 h-8 w-8 text-primary" />
            <h3 className="mb-1 font-semibold">View Certificates</h3>
            <p className="text-sm text-muted-foreground">Access and download your earned certificates.</p>
          </Link>
        </Card>
        <Card className="cursor-pointer transition-shadow hover:shadow-md">
          <Link href="/student/settings" className="block p-6">
            <TrendingUp className="mb-3 h-8 w-8 text-primary" />
            <h3 className="mb-1 font-semibold">Profile Settings</h3>
            <p className="text-sm text-muted-foreground">Update your profile and preferences.</p>
          </Link>
        </Card>
      </div>
    </div>
  )
}
