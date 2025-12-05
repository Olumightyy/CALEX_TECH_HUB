"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, TrendingUp, Clock, Award } from "lucide-react"

interface CourseAnalyticsProps {
  courseId: string
}

export function CourseAnalytics({ courseId }: CourseAnalyticsProps) {
  const [stats, setStats] = useState({
    totalEnrollments: 0,
    activeStudents: 0,
    completionRate: 0,
    avgProgress: 0,
    certificatesIssued: 0,
    totalLessons: 0,
  })
  const [recentEnrollments, setRecentEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      const supabase = createClient()

      // Fetch enrollments
      const { data: enrollments, count: totalEnrollments } = await supabase
        .from("enrollments")
        .select("*, profiles(full_name, avatar_url)", { count: "exact" })
        .eq("course_id", courseId)
        .order("enrolled_at", { ascending: false })

      // Fetch completed enrollments
      const { count: completedCount } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("course_id", courseId)
        .eq("completed", true)

      // Fetch certificates
      const { count: certificatesCount } = await supabase
        .from("certificates")
        .select("*", { count: "exact", head: true })
        .eq("course_id", courseId)

      // Fetch lessons count
      const { data: modules } = await supabase.from("modules").select("lessons(count)").eq("course_id", courseId)

      const totalLessons = modules?.reduce((acc, m) => acc + (m.lessons?.[0]?.count || 0), 0) || 0

      // Calculate avg progress
      const avgProgress = enrollments?.length
        ? enrollments.reduce((acc, e) => acc + (e.progress_percentage || 0), 0) / enrollments.length
        : 0

      setStats({
        totalEnrollments: totalEnrollments || 0,
        activeStudents: enrollments?.filter((e) => !e.completed).length || 0,
        completionRate: totalEnrollments ? Math.round(((completedCount || 0) / totalEnrollments) * 100) : 0,
        avgProgress: Math.round(avgProgress),
        certificatesIssued: certificatesCount || 0,
        totalLessons,
      })

      setRecentEnrollments(enrollments?.slice(0, 10) || [])
      setLoading(false)
    }

    fetchAnalytics()
  }, [courseId])

  const statCards = [
    {
      title: "Total Enrollments",
      value: stats.totalEnrollments,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Active Students",
      value: stats.activeStudents,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate}%`,
      icon: Award,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Avg Progress",
      value: `${stats.avgProgress}%`,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Certificates Issued",
      value: stats.certificatesIssued,
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Lessons",
      value: stats.totalLessons,
      icon: BookOpen,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {statCards.map((stat) => (
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
          <CardTitle>Recent Enrollments</CardTitle>
          <CardDescription>Students who recently enrolled in this course</CardDescription>
        </CardHeader>
        <CardContent>
          {recentEnrollments.length > 0 ? (
            <div className="space-y-4">
              {recentEnrollments.map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {enrollment.profiles?.full_name?.charAt(0) || "S"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{enrollment.profiles?.full_name || "Student"}</p>
                      <p className="text-sm text-muted-foreground">
                        Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{enrollment.progress_percentage || 0}%</p>
                    <p className="text-sm text-muted-foreground">Progress</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No enrollments yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
