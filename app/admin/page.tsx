import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Users, BookOpen, DollarSign, Clock, CheckCircle, UserCheck, ArrowUpRight, ArrowDownRight } from "lucide-react"

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch stats
  const { count: totalStudents } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "student")

  const { count: totalTeachers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "teacher")
    .eq("is_verified", true)

  const { count: pendingTeachers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "teacher")
    .eq("is_verified", false)

  const { count: totalCourses } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")

  const { count: pendingCourses } = await supabase
    .from("courses")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending_review")

  const { count: totalEnrollments } = await supabase.from("enrollments").select("*", { count: "exact", head: true })

  // Fetch revenue
  const { data: payments } = await supabase.from("payments").select("amount").eq("status", "completed")

  const totalRevenue = payments?.reduce((acc, p) => acc + (p.amount || 0), 0) || 0

  // Fetch pending courses for review
  const { data: coursesForReview } = await supabase
    .from("courses")
    .select(`
      *,
      profiles(full_name)
    `)
    .eq("status", "pending_review")
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch pending teacher applications
  const { data: teacherApplications } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "teacher")
    .eq("is_verified", false)
    .order("created_at", { ascending: false })
    .limit(5)

  // Fetch recent payments
  const { data: recentPayments } = await supabase
    .from("payments")
    .select(`
      *,
      profiles(full_name),
      courses(title)
    `)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(5)

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "All time earnings",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Total Students",
      value: totalStudents || 0,
      icon: Users,
      description: "Registered students",
      color: "text-primary",
      bgColor: "bg-primary/10",
      trend: "+8.2%",
      trendUp: true,
    },
    {
      title: "Published Courses",
      value: totalCourses || 0,
      icon: BookOpen,
      description: `${pendingCourses} pending review`,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      trend: "+5.1%",
      trendUp: true,
    },
    {
      title: "Verified Teachers",
      value: totalTeachers || 0,
      icon: UserCheck,
      description: `${pendingTeachers} pending verification`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "+3.4%",
      trendUp: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform overview and management</p>
        </div>
        <div className="flex items-center gap-2">
          {(pendingCourses || 0) > 0 && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              {pendingCourses} courses pending
            </Badge>
          )}
          {(pendingTeachers || 0) > 0 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {pendingTeachers} teachers pending
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${stat.trendUp ? "text-emerald-600" : "text-red-600"}`}
                >
                  {stat.trendUp ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {stat.trend}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Courses Pending Review */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Courses Pending Review
              </CardTitle>
              <CardDescription>Courses awaiting your approval</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/courses?status=pending_review">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {coursesForReview && coursesForReview.length > 0 ? (
              <div className="space-y-4">
                {coursesForReview.map((course) => (
                  <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{course.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        by {course.profiles?.full_name || "Unknown"} ·{" "}
                        {new Date(course.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/admin/courses/${course.id}`}>Review</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-emerald-500" />
                <p className="mt-2 text-muted-foreground">All courses reviewed</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Teacher Applications */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-blue-500" />
                Teacher Applications
              </CardTitle>
              <CardDescription>Pending teacher verifications</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/teachers?status=pending">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {teacherApplications && teacherApplications.length > 0 ? (
              <div className="space-y-4">
                {teacherApplications.map((teacher) => (
                  <div key={teacher.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-medium text-primary">{teacher.full_name?.charAt(0) || "T"}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{teacher.full_name || "Unknown"}</h4>
                        <p className="text-sm text-muted-foreground">
                          Applied {new Date(teacher.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/admin/teachers/${teacher.id}`}>Review</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-emerald-500" />
                <p className="mt-2 text-muted-foreground">No pending applications</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest payment activities</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/revenue">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentPayments && recentPayments.length > 0 ? (
            <div className="space-y-4">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{payment.profiles?.full_name || "Student"}</h4>
                      <p className="text-sm text-muted-foreground">{payment.courses?.title || "Course"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-emerald-600">+${payment.amount}</p>
                    <p className="text-xs text-muted-foreground">{new Date(payment.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">No payments yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
