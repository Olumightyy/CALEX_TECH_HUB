import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BookOpen, Users, Clock, AlertCircle, PlusCircle, BarChart3, MessageSquare, Settings, ArrowRight, Shield, CheckCircle } from "lucide-react"

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
  
  // Gets teacher profile for welcome message
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user?.id || "").single()

  const publishedCourses = courses?.filter((c) => c.status === "published").length || 0
  const pendingCourses = courses?.filter((c) => c.status === "pending_review").length || 0
  const draftCourses = courses?.filter((c) => c.status === "draft").length || 0

  const stats = [
    {
      title: "Total Courses",
      value: courses?.length || 0,
      icon: BookOpen,
      description: `${publishedCourses} published`,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Total Students",
      value: totalEnrollments || 0,
      icon: Users,
      description: "Enrolled in your courses",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "Pending Review",
      value: pendingCourses,
      icon: Clock,
      description: "Awaiting admin approval",
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    },
    {
      title: "Draft Courses",
      value: draftCourses,
      icon: AlertCircle,
      description: "Not yet submitted",
      color: "text-rose-600",
      bgColor: "bg-rose-100",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">Published</Badge>
      case "pending_review":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200">Pending Review</Badge>
      case "draft":
        return <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">Draft</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, <span className="text-amber-600">{profile?.full_name?.split(" ")[0] || "Teacher"}</span>
          </h1>
          <p className="mt-1 text-slate-500">Manage your courses and track student engagement.</p>
        </div>
        <div className="flex gap-3">
            <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white shadow-md">
              <Link href="/teacher/courses/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Course
              </Link>
            </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* My Courses */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">My Courses</CardTitle>
              <CardDescription className="text-slate-500">Your created courses and their status</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
              <Link href="/teacher/courses">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {courses && courses.length > 0 ? (
              <div className="space-y-4">
                {courses.slice(0, 5).map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-200 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                         {course.thumbnail_url ? (
                              <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover rounded-lg" />
                         ) : (
                              <BookOpen className="h-5 w-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                         )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 line-clamp-1">{course.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
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
                    <div className="flex items-center gap-3 pl-4">
                      {getStatusBadge(course.status)}
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-400 hover:text-amber-600 hover:bg-white">
                        <Link href={`/teacher/courses/${course.id}`}>
                            <Settings className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <BookOpen className="h-10 w-10 mx-auto text-slate-300 mb-3" />
                <h3 className="text-lg font-bold text-slate-900">No courses yet</h3>
                <p className="text-sm text-slate-500 mb-4">Create your first course to start teaching</p>
                <Button asChild className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold shadow-sm">
                  <Link href="/teacher/courses/new">Create Course</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card className="border-slate-200 shadow-sm h-fit">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900">Recent Enrollments</CardTitle>
            <CardDescription className="text-slate-500">New students joining your courses</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {recentEnrollments && recentEnrollments.length > 0 ? (
              <div className="space-y-6">
                {recentEnrollments.map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        {enrollment.profiles?.avatar_url ? (
                            <img src={enrollment.profiles.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                             <span className="text-xs font-bold text-slate-500">
                                {enrollment.profiles?.full_name?.charAt(0) || "S"}
                              </span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {enrollment.profiles?.full_name || "Student"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{enrollment.courses?.title}</p>
                    </div>
                    <p className="text-xs font-medium text-slate-400 whitespace-nowrap">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-10 w-10 mx-auto text-slate-200 mb-2" />
                <p className="text-sm text-slate-500">No enrollments recorded yet</p>
              </div>
            )}
             <div className="mt-6 pt-6 border-t border-slate-100">
                 <Button variant="outline" className="w-full text-slate-600 hover:text-amber-600 border-slate-200" asChild>
                    <Link href="/teacher/analytics">View Analytics</Link>
                 </Button>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-bold text-slate-900 pt-2">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-4">
        {[
            { title: "Create Course", icon: PlusCircle, href: "/teacher/courses/new", color: "text-amber-600", bg: "bg-amber-50" },
            { title: "View Analytics", icon: BarChart3, href: "/teacher/analytics", color: "text-indigo-600", bg: "bg-indigo-50" },
            { title: "Announcements", icon: MessageSquare, href: "/teacher/announcements", color: "text-emerald-600", bg: "bg-emerald-50" },
            { title: "Settings", icon: Settings, href: "/teacher/settings", color: "text-slate-600", bg: "bg-slate-50" },
        ].map((action) => (
             <Link key={action.title} href={action.href} className="group">
                <Card className="border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all group-hover:-translate-y-0.5">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-3">
                        <div className={`p-3 rounded-full ${action.bg} group-hover:scale-110 transition-transform`}>
                            <action.icon className={`h-6 w-6 ${action.color}`} />
                        </div>
                        <span className="font-semibold text-slate-900">{action.title}</span>
                    </CardContent>
                </Card>
             </Link>
        ))}
      </div>
    </div>
  )
}
