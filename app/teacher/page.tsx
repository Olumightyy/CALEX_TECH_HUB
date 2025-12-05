import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  BookOpen,
  Users,
  Clock,
  AlertCircle,
  PlusCircle,
  BarChart3,
  MessageSquare,
  Settings,
  TrendingUp,
  ArrowRight,
} from "lucide-react"

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: courses } = await supabase
    .from("courses")
    .select(`*, enrollments(count), modules(count)`)
    .eq("teacher_id", user?.id)
    .order("created_at", { ascending: false })

  const { count: totalEnrollments } = await supabase
    .from("enrollments")
    .select("*, courses!inner(*)", { count: "exact", head: true })
    .eq("courses.teacher_id", user?.id)

  const { data: recentEnrollments } = await supabase
    .from("enrollments")
    .select(`*, courses!inner(*), profiles(full_name, avatar_url)`)
    .eq("courses.teacher_id", user?.id)
    .order("enrolled_at", { ascending: false })
    .limit(5)

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user?.id).single()

  const publishedCourses = courses?.filter((c) => c.status === "published").length || 0
  const pendingCourses = courses?.filter((c) => c.status === "pending_review").length || 0
  const draftCourses = courses?.filter((c) => c.status === "draft").length || 0

  const stats = [
    {
      title: "Total Courses",
      value: courses?.length || 0,
      subtitle: `${publishedCourses} published`,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
      trend: "+2 this month",
    },
    {
      title: "Total Students",
      value: totalEnrollments || 0,
      subtitle: "Enrolled across all courses",
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      trend: "+12% growth",
    },
    {
      title: "Pending Review",
      value: pendingCourses,
      subtitle: "Awaiting approval",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
    {
      title: "Draft Courses",
      value: draftCourses,
      subtitle: "Not yet submitted",
      icon: AlertCircle,
      color: "text-slate-600",
      bg: "bg-slate-500/10",
    },
  ]

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      published: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
      pending_review: "bg-amber-500/10 text-amber-700 border-amber-500/20",
      draft: "bg-slate-500/10 text-slate-700 border-slate-500/20",
      rejected: "bg-rose-500/10 text-rose-700 border-rose-500/20",
    }
    return (
      <Badge variant="outline" className={styles[status] || ""}>
        {status.replace("_", " ")}
      </Badge>
    )
  }

  const firstName = profile?.full_name?.split(" ")[0] || "Instructor"

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {firstName}!</h1>
          <p className="mt-1 text-muted-foreground">Manage your courses and track student engagement</p>
        </div>
        <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
          <Link href="/teacher/courses/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/50 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.subtitle}</p>
                  {stat.trend && (
                    <p className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600">
                      <TrendingUp className="h-3 w-3" />
                      {stat.trend}
                    </p>
                  )}
                </div>
                <div className={`rounded-xl p-3 ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* My Courses */}
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>Your created courses and their status</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="rounded-lg bg-transparent">
              <Link href="/teacher/courses">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {courses && courses.length > 0 ? (
              <div className="space-y-3">
                {courses.slice(0, 5).map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-20 overflow-hidden rounded-lg bg-primary/10">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url || "/placeholder.svg"}
                            alt={course.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <BookOpen className="h-6 w-6 text-primary" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{course.title}</h4>
                        <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {course.enrollments?.[0]?.count || 0} students
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            {course.modules?.[0]?.count || 0} modules
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(course.status)}
                      <Button variant="ghost" size="sm" asChild className="rounded-lg">
                        <Link href={`/teacher/courses/${course.id}`}>Edit</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 rounded-full bg-muted p-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No courses yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Create your first course to start teaching</p>
                <Button className="mt-4 rounded-xl" asChild>
                  <Link href="/teacher/courses/new">Create Course</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>Recent Enrollments</CardTitle>
            <CardDescription>New students in your courses</CardDescription>
          </CardHeader>
          <CardContent>
            {recentEnrollments && recentEnrollments.length > 0 ? (
              <div className="space-y-4">
                {recentEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                      {enrollment.profiles?.avatar_url ? (
                        <img
                          src={enrollment.profiles.avatar_url || "/placeholder.svg"}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-primary">
                          {enrollment.profiles?.full_name?.charAt(0) || "S"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {enrollment.profiles?.full_name || "Student"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{enrollment.courses?.title}</p>
                    </div>
                    <p className="flex-shrink-0 text-xs text-muted-foreground">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No enrollments yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for course creators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: "/teacher/courses/new",
                icon: PlusCircle,
                label: "Create Course",
                color: "text-blue-600",
                bg: "bg-blue-500/10",
              },
              {
                href: "/teacher/analytics",
                icon: BarChart3,
                label: "View Analytics",
                color: "text-emerald-600",
                bg: "bg-emerald-500/10",
              },
              {
                href: "/teacher/announcements",
                icon: MessageSquare,
                label: "Announcements",
                color: "text-amber-600",
                bg: "bg-amber-500/10",
              },
              {
                href: "/teacher/settings",
                icon: Settings,
                label: "Settings",
                color: "text-slate-600",
                bg: "bg-slate-500/10",
              },
            ].map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md">
                  <div className={`rounded-xl p-3 ${action.bg}`}>
                    <action.icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <span className="font-medium text-foreground">{action.label}</span>
                  <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
