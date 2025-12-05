import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CourseCard } from "@/components/courses/course-card"
import { Button } from "@/components/ui/button"
import { BookOpen, ArrowRight, Shield } from "lucide-react"

async function getEnrollments(userId: string) {
  const supabase = await createClient()

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      course:courses(
        *,
        teacher:profiles!teacher_id(id, full_name, avatar_url),
        category:categories(id, name, slug)
      )
    `)
    .eq("student_id", userId)
    .order("enrolled_at", { ascending: false })

  return enrollments || []
}

export default async function MyCoursesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const enrollments = await getEnrollments(user.id)

  const activeEnrollments = enrollments.filter((e) => e.status === "active")
  const completedEnrollments = enrollments.filter((e) => e.status === "completed")

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <div className="bg-amber-100 p-2 rounded-lg">
                  <BookOpen className="h-5 w-5 text-amber-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">My Courses</h1>
           </div>
           <p className="text-slate-500 max-w-2xl">
             Manage your enrolled courses and track your progress.
           </p>
        </div>
        <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white shadow-md">
          <Link href="/courses">
            Browse New Courses
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl h-auto shadow-sm inline-flex">
          <TabsTrigger 
            value="active" 
            className="rounded-lg px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-600 hover:text-amber-600 transition-all font-medium"
          >
            In Progress ({activeEnrollments.length})
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="rounded-lg px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-600 hover:text-amber-600 transition-all font-medium"
          >
            Completed ({completedEnrollments.length})
          </TabsTrigger>
          <TabsTrigger 
            value="all" 
            className="rounded-lg px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-600 hover:text-amber-600 transition-all font-medium"
          >
            All Courses ({enrollments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-8">
          {activeEnrollments.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {activeEnrollments.map((enrollment) => (
                <CourseCard
                  key={enrollment.id}
                  course={enrollment.course}
                  showProgress
                  progress={enrollment.progress}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-8">
          {completedEnrollments.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
               <div className="bg-slate-50 p-4 rounded-full mb-4">
                  <Shield className="h-8 w-8 text-slate-300" />
               </div>
               <h3 className="mb-1 text-lg font-bold text-slate-900">No completed courses yet</h3>
               <p className="text-slate-500 max-w-sm">Keep passing those lessons and quizzes! Your certificates are waiting.</p>
             </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {completedEnrollments.map((enrollment) => (
                <CourseCard key={enrollment.id} course={enrollment.course} showProgress progress={100} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-8">
          {enrollments.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {enrollments.map((enrollment) => (
                <CourseCard
                  key={enrollment.id}
                  course={enrollment.course}
                  showProgress
                  progress={enrollment.progress}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
      <div className="bg-amber-50 p-6 rounded-full mb-4">
         <BookOpen className="h-10 w-10 text-amber-500" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-slate-900">No courses found</h3>
      <p className="mb-8 text-slate-500 max-w-md">
        You haven&apos;t enrolled in any courses yet. Start your journey today by browsing our catalog.
      </p>
      <Button asChild size="lg" className="bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg">
        <Link href="/courses">Browse Courses</Link>
      </Button>
    </div>
  )
}
