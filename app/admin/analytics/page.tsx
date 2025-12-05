import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, DollarSign, Award, TrendingUp, Activity } from "lucide-react"

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  // Fetch various metrics
  const { count: totalStudents } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")

  const { count: totalTeachers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "teacher")
    .eq("is_verified", true)

  const { count: totalCourses } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")

  const { count: totalEnrollments } = await supabase.from("enrollments").select("*", { count: "exact", head: true })

  const { count: totalCertificates } = await supabase.from("certificates").select("*", { count: "exact", head: true })

  const { count: completedEnrollments } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("completed", true)

  const { data: payments } = await supabase.from("payments").select("amount").eq("status", "completed")

  const totalRevenue = payments?.reduce((acc, p) => acc + (p.amount || 0), 0) || 0

  // Top courses by enrollment
  const { data: topCourses } = await supabase
    .from("courses")
    .select(`
      id,
      title,
      enrollments(count)
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(10)

  const sortedTopCourses = topCourses
    ?.map((c) => ({
      ...c,
      enrollmentCount: c.enrollments?.[0]?.count || 0,
    }))
    .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
    .slice(0, 5)

  // Calculate completion rate
  const completionRate = totalEnrollments ? Math.round(((completedEnrollments || 0) / totalEnrollments) * 100) : 0

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Total Students",
      value: totalStudents || 0,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Verified Teachers",
      value: totalTeachers || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Published Courses",
      value: totalCourses || 0,
      icon: BookOpen,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Total Enrollments",
      value: totalEnrollments || 0,
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Certificates Issued",
      value: totalCertificates || 0,
      icon: Award,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Platform Analytics</h1>
        <p className="text-muted-foreground mt-1">Comprehensive overview of platform performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Completion Rate */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Course Completion Rate</CardTitle>
            <CardDescription>Percentage of students completing courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${completionRate * 4.4} 440`}
                    className="text-emerald-500"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold">{completionRate}%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 text-center">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{completedEnrollments || 0}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{(totalEnrollments || 0) - (completedEnrollments || 0)}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Courses */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Top Performing Courses</CardTitle>
            <CardDescription>Courses with highest enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            {sortedTopCourses && sortedTopCourses.length > 0 ? (
              <div className="space-y-4">
                {sortedTopCourses.map((course, index) => (
                  <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {index + 1}
                      </span>
                      <span className="font-medium truncate max-w-[200px]">{course.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{course.enrollmentCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">No course data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
