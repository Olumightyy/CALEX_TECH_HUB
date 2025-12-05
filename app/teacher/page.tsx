import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BookOpen, Users, Clock, AlertCircle, PlusCircle, BarChart3, MessageSquare, Settings } from "lucide-react"

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch teacher's courses
  const { data: courses } = await supabase
    .from("courses")
    .select(`
      *,
      enrollments(count),
      modules(count)
    `)
    .eq("teacher_id", user?.id)
    .order("created_at", { ascending: false })

  // Fetch total enrollments across all courses
  const { count: totalEnrollments } = await supabase
    .from("enrollments")
    .select("*, courses!inner(*)", { count: "exact", head: true })
    .eq("courses.teacher_id", user?.id)

  // Fetch recent enrollments
  const { data: recentEnrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      courses!inner(*),
      profiles(full_name, avatar_url)
    `)
    .eq("courses.teacher_id", user?.id)
    .order("enrolled_at", { ascending: false })
    .limit(5)

  const publishedCourses = courses?.filter((c) => c.status === "published").length || 0
  const pendingCourses = courses?.filter((c) => c.status === "pending_review").length || 0
  const draftCourses = courses?.filter((c) => c.status === "draft").length || 0

  const stats = [
    {
      title: "Total Courses",
      value: courses?.length || 0,
      icon: BookOpen,
      description: `${publishedCourses} published`,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Students",
      value: totalEnrollments || 0,
      icon: Users,
      description: "Enrolled in your courses",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Pending Review",
      value: pendingCourses,
      icon: Clock,
      description: "Awaiting admin approval",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Draft Courses",
      value: draftCourses,
      icon: AlertCircle,
      description: "Not yet submitted",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-emerald-100 text-emerald-700">Published</Badge>
      case "pending_review":
        return <Badge className="bg-amber-100 text-amber-700">Pending Review</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Teacher Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your courses and track student engagement</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/teacher/courses/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* My Courses */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>Your created courses and their status</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/teacher/courses">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {courses && courses.length > 0 ? (
              <div className="space-y-4">
                {courses.slice(0, 5).map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{course.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course.enrollments?.[0]?.count || 0} students
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {course.modules?.[0]?.count || 0} modules
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(course.status)}
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/teacher/courses/${course.id}`}>Edit</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium text-foreground">No courses yet</h3>
                <p className="mt-2 text-muted-foreground">Create your first course to start teaching</p>
                <Button className="mt-4" asChild>
                  <Link href="/teacher/courses/new">Create Course</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Enrollments</CardTitle>
            <CardDescription>New students in your courses</CardDescription>
          </CardHeader>
          <CardContent>
            {recentEnrollments && recentEnrollments.length > 0 ? (
              <div className="space-y-4">
                {recentEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {enrollment.profiles?.full_name?.charAt(0) || "S"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {enrollment.profiles?.full_name || "Student"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{enrollment.courses?.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-8 w-8 mx-auto text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">No enrollments yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for course creators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent" asChild>
              <Link href="/teacher/courses/new">
                <PlusCircle className="h-6 w-6 text-primary" />
                <span>Create New Course</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent" asChild>
              <Link href="/teacher/analytics">
                <BarChart3 className="h-6 w-6 text-emerald-600" />
                <span>View Analytics</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent" asChild>
              <Link href="/teacher/announcements">
                <MessageSquare className="h-6 w-6 text-amber-600" />
                <span>Post Announcement</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent" asChild>
              <Link href="/teacher/settings">
                <Settings className="h-6 w-6 text-muted-foreground" />
                <span>Settings</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
