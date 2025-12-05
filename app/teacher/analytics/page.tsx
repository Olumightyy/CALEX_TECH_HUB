import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, TrendingUp, Award } from "lucide-react"

export default async function TeacherAnalyticsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch all courses with enrollments
  const { data: courses } = await supabase
    .from("courses")
    .select(`
      *,
      enrollments(count),
      certificates(count)
    `)
    .eq("teacher_id", user?.id)

  const totalCourses = courses?.length || 0
  const totalEnrollments = courses?.reduce((acc, c) => acc + (c.enrollments?.[0]?.count || 0), 0) || 0
  const totalCertificates = courses?.reduce((acc, c) => acc + (c.certificates?.[0]?.count || 0), 0) || 0

  // Course performance
  const coursePerformance =
    courses
      ?.map((course) => ({
        id: course.id,
        title: course.title,
        enrollments: course.enrollments?.[0]?.count || 0,
        certificates: course.certificates?.[0]?.count || 0,
        status: course.status,
      }))
      .sort((a, b) => b.enrollments - a.enrollments) || []

  const stats = [
    {
      title: "Total Students",
      value: totalEnrollments,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Published Courses",
      value: courses?.filter((c) => c.status === "published").length || 0,
      icon: BookOpen,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Certificates Issued",
      value: totalCertificates,
      icon: Award,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Avg. Students/Course",
      value: totalCourses ? Math.round(totalEnrollments / totalCourses) : 0,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics Overview</h1>
        <p className="text-muted-foreground mt-1">Track your teaching performance and student engagement</p>
      </div>

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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Course Performance</CardTitle>
          <CardDescription>How your courses are performing</CardDescription>
        </CardHeader>
        <CardContent>
          {coursePerformance.length > 0 ? (
            <div className="space-y-4">
              {coursePerformance.map((course, index) => (
                <div key={course.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground w-8">#{index + 1}</span>
                    <div>
                      <h4 className="font-medium">{course.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {course.enrollments} students · {course.certificates} certificates
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{course.enrollments}</p>
                      <p className="text-xs text-muted-foreground">Enrollments</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No courses yet</h3>
              <p className="mt-2 text-muted-foreground">Create courses to see performance analytics</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
