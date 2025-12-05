import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Award, Clock, TrendingUp, ArrowRight, Play, Shield, CheckCircle, Settings } from "lucide-react"

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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome back, <span className="text-amber-600">{profile?.full_name?.split(" ")[0] || "Student"}</span>
          </h1>
          <p className="mt-1 text-slate-500">Track your progress and continue your learning journey.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="px-4 py-2 bg-slate-900 text-white rounded-lg shadow-md flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">Student Portal</span>
           </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.activeCourses}</div>
            <p className="text-xs text-slate-500 mt-1">Currently enrolled</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.completedCourses}</div>
            <p className="text-xs text-slate-500 mt-1">Courses finished</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Certificates</CardTitle>
            <Award className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.certificates}</div>
            <p className="text-xs text-slate-500 mt-1">Earned so far</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Learning Time</CardTitle>
            <Clock className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.learningHours}h</div>
            <p className="text-xs text-slate-500 mt-1">Total hours spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
             <h2 className="text-xl font-bold text-slate-900">Continue Learning</h2>
             <p className="text-sm text-slate-500">Pick up where you left off</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">
            <Link href="/student/my-courses">
              View all courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {enrollments.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed border-2 border-slate-200 bg-slate-50/50">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
               <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-slate-900">No courses yet</h3>
            <p className="mb-6 text-slate-500 max-w-sm">Start your learning journey by enrolling in a course from our extensive catalog.</p>
            <Button asChild className="bg-slate-900 text-white hover:bg-slate-800 shadow-md">
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                  <Card className="overflow-hidden border-slate-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white">
                    <div className="relative aspect-video">
                        {enrollment.course.thumbnail_url ? (
                            <img
                              src={enrollment.course.thumbnail_url}
                              alt={enrollment.course.title}
                              className="h-full w-full object-cover"
                            />
                        ) : (
                             <div className="h-full w-full bg-slate-100 flex items-center justify-center">
                                <BookOpen className="h-10 w-10 text-slate-300" />
                             </div>
                        )}
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-sm">
                        <div className="rounded-full bg-white/20 p-3 text-white backdrop-blur-md border border-white/30">
                           <Play className="h-6 w-6 fill-white" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <div className="mb-3">
                        <p className="text-xs font-medium text-amber-600 mb-1">
                             {enrollment.course.teacher?.full_name || "Instructor"}
                        </p>
                        <h3 className="line-clamp-2 font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                          {enrollment.course.title}
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 font-medium">Progress</span>
                          <span className="text-slate-900 font-bold">{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2 bg-slate-100" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ),
            )}
            
            {/* Add a "Browse More" card at the end if fewer than 3 enrollments, or purely as a separate element? 
                Actually, the grid is better uniform. I'll leave it as just enrollments. 
            */}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Link href="/courses" className="block group">
            <Card className="h-full border-slate-200 hover:border-amber-500/50 hover:shadow-md transition-all group-hover:-translate-y-1">
                <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <BookOpen className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">Browse Courses</h3>
                    <p className="text-sm text-slate-500">Discover new skills and expand your knowledge base.</p>
                </CardContent>
            </Card>
          </Link>

          <Link href="/student/certificates" className="block group">
            <Card className="h-full border-slate-200 hover:border-amber-500/50 hover:shadow-md transition-all group-hover:-translate-y-1">
                <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <Award className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">View Certificates</h3>
                    <p className="text-sm text-slate-500">Access and download your earned credentials.</p>
                </CardContent>
            </Card>
          </Link>

          <Link href="/student/settings" className="block group">
            <Card className="h-full border-slate-200 hover:border-amber-500/50 hover:shadow-md transition-all group-hover:-translate-y-1">
                <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center mb-4 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <Settings className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">Profile Settings</h3>
                    <p className="text-sm text-slate-500">Update your profile and account preferences.</p>
                </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
