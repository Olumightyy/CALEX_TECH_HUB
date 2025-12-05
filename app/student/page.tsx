import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Award, Clock, TrendingUp, ArrowRight, Play, Target, Flame, Sparkles } from "lucide-react"

async function getStudentData(userId: string) {
  const supabase = await createClient()

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

  const { count: certificatesCount } = await supabase
    .from("certificates")
    .select("id", { count: "exact" })
    .eq("student_id", userId)

  const { count: completedCount } = await supabase
    .from("enrollments")
    .select("id", { count: "exact" })
    .eq("student_id", userId)
    .eq("status", "completed")

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

  const firstName = profile?.full_name?.split(" ")[0] || "Student"
  const greeting =
    new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening"

  const statCards = [
    {
      title: "Active Courses",
      value: stats.activeCourses,
      subtitle: "In progress",
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      title: "Completed",
      value: stats.completedCourses,
      subtitle: "Courses finished",
      icon: Target,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Certificates",
      value: stats.certificates,
      subtitle: "Earned",
      icon: Award,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
    {
      title: "Learning Time",
      value: `${stats.learningHours}h`,
      subtitle: "Total hours",
      icon: Clock,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="secondary" className="gap-1.5 rounded-full text-xs sm:text-sm">
              <Flame className="h-3 w-3 text-orange-500 sm:h-3.5 sm:w-3.5" />7 Day Streak
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {greeting}, {firstName}!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Track your progress and continue your learning journey.
          </p>
        </div>
        <Button asChild className="w-full rounded-xl shadow-lg shadow-primary/20 sm:w-auto">
          <Link href="/courses">
            <Sparkles className="mr-2 h-4 w-4" />
            Explore Courses
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border/50 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="order-2 sm:order-1">
                  <p className="text-xs font-medium text-muted-foreground sm:text-sm">{stat.title}</p>
                  <p className="mt-1 text-2xl font-bold text-foreground sm:mt-2 sm:text-3xl">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{stat.subtitle}</p>
                </div>
                <div className={`order-1 rounded-lg p-2 sm:order-2 sm:rounded-xl sm:p-3 ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Continue Learning */}
      <div>
        <div className="mb-4 flex items-center justify-between sm:mb-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">Continue Learning</h2>
            <p className="text-xs text-muted-foreground sm:text-sm">Pick up where you left off</p>
          </div>
          <Button asChild variant="ghost" className="gap-1 text-primary text-xs sm:gap-2 sm:text-sm">
            <Link href="/student/my-courses">
              View all
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Link>
          </Button>
        </div>

        {enrollments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center sm:py-16">
              <div className="mb-3 rounded-full bg-muted p-3 sm:mb-4 sm:p-4">
                <BookOpen className="h-8 w-8 text-muted-foreground sm:h-10 sm:w-10" />
              </div>
              <h3 className="mb-1.5 text-base font-semibold sm:mb-2 sm:text-lg">No courses yet</h3>
              <p className="mb-4 max-w-sm text-xs text-muted-foreground sm:mb-6 sm:text-sm">
                Start your learning journey by enrolling in a course that interests you.
              </p>
              <Button asChild className="rounded-xl">
                <Link href="/courses">Browse Courses</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
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
                  <Card className="overflow-hidden border-border/50 transition-all hover:border-primary/30 hover:shadow-lg">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative aspect-video w-full flex-shrink-0 overflow-hidden bg-muted sm:aspect-auto sm:h-32 sm:w-36 md:w-44">
                        <img
                          src={
                            enrollment.course.thumbnail_url ||
                            `/placeholder.svg?height=128&width=176&query=${encodeURIComponent(enrollment.course.title) || "/placeholder.svg"}`
                          }
                          alt={enrollment.course.title}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary sm:h-12 sm:w-12">
                            <Play className="ml-0.5 h-4 w-4 text-primary-foreground sm:h-5 sm:w-5" />
                          </div>
                        </div>
                      </div>
                      <CardContent className="flex flex-1 flex-col justify-between p-3 sm:p-4">
                        <div>
                          <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-foreground group-hover:text-primary sm:text-base">
                            {enrollment.course.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">{enrollment.course.teacher?.full_name}</p>
                        </div>
                        <div className="mt-2 sm:mt-3">
                          <div className="mb-1 flex items-center justify-between text-xs sm:mb-1.5">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold text-foreground">{enrollment.progress}%</span>
                          </div>
                          <Progress value={enrollment.progress} className="h-1.5 sm:h-2" />
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
      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground sm:mb-4 sm:text-xl">Quick Actions</h2>
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
          {[
            {
              href: "/courses",
              icon: BookOpen,
              title: "Browse Courses",
              description: "Discover new courses",
              color: "text-blue-600",
              bg: "bg-blue-500/10",
            },
            {
              href: "/student/certificates",
              icon: Award,
              title: "View Certificates",
              description: "Download your achievements",
              color: "text-amber-600",
              bg: "bg-amber-500/10",
            },
            {
              href: "/student/settings",
              icon: TrendingUp,
              title: "Profile Settings",
              description: "Update your profile",
              color: "text-emerald-600",
              bg: "bg-emerald-500/10",
            },
          ].map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="h-full border-border/50 transition-all hover:border-primary/30 hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4 sm:block sm:p-6">
                  <div className={`inline-flex rounded-lg p-2.5 sm:mb-4 sm:rounded-xl sm:p-3 ${action.bg}`}>
                    <action.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${action.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground sm:text-base">{action.title}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">{action.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
