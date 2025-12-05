import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { BookOpen, Users, PlusCircle, MoreVertical, Edit, Eye, Trash2, Search, Filter } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export default async function TeacherCoursesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return redirect("/auth/login")

  const { data: courses } = await supabase
    .from("courses")
    .select(`
      *,
      enrollments(count),
      modules(count),
      categories(name)
    `)
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false })

  const allCourses = courses || []
  const publishedCourses = allCourses.filter((c) => c.status === "published")
  const draftCourses = allCourses.filter((c) => c.status === "draft")
  const pendingCourses = allCourses.filter((c) => c.status === "pending_review")
  const rejectedCourses = allCourses.filter((c) => c.status === "rejected")

  const deleteCourse = async (formData: FormData) => {
    "use server"
    const courseId = formData.get("courseId") as string
    if (!courseId) return

    const supabase = await createClient()
    const { error } = await supabase.from("courses").delete().eq("id", courseId)
    
    if (error) {
        console.error("Delete failed:", error)
        // Ideally show toast, but difficult in server action without client component wrapper
        // Use revalidatePath to refresh
    }
    revalidatePath("/teacher/courses")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none">Published</Badge>
      case "pending_review":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none">Pending</Badge>
      case "draft":
        return <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">Draft</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const CourseList = ({ courseList }: { courseList: typeof allCourses }) => (
    <div className="space-y-4">
      {courseList.length > 0 ? (
        courseList.map((course) => (
          <div
            key={course.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-xl border border-slate-200 bg-white hover:border-amber-300 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-5">
              <div className="h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url || "/placeholder.svg"}
                    alt={course.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <BookOpen className="h-8 w-8 text-slate-300" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-amber-600 transition-colors">{course.title}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                  <Badge variant="outline" className="text-[10px] font-normal border-slate-200">{course.categories?.name || "Uncategorized"}</Badge>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {course.enrollments?.[0]?.count || 0} students
                  </span>
                  <span className="font-semibold text-slate-700">{course.price === 0 ? "Free" : `₦${course.price.toLocaleString()}`}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
              {getStatusBadge(course.status)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={`/teacher/courses/${course.id}`} className="cursor-pointer">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Course
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/courses/${course.slug}`} target="_blank" className="cursor-pointer">
                      <Eye className="mr-2 h-4 w-4" />
                      Preview Public Page
                    </Link>
                  </DropdownMenuItem>
                  <form action={deleteCourse}>
                      <input type="hidden" name="courseId" value={course.id} />
                      <button type="submit" className="w-full flex items-center px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 rounded-sm cursor-pointer outline-none">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </button>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4">
               <BookOpen className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-slate-900">No courses found</h3>
          <p className="max-w-sm text-slate-500 mb-6">Create your first course to share your knowledge with the world.</p>
          <Button asChild className="bg-slate-900 hover:bg-slate-800">
            <Link href="/teacher/courses/new">Create Course</Link>
          </Button>
        </div>
      )}
    </div>
  )

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
             Create, manage and organize your curriculum.
           </p>
        </div>
        <Button asChild size="lg" className="bg-slate-900 hover:bg-slate-800 text-white shadow-md">
          <Link href="/teacher/courses/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Course
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search courses..." className="pl-10 bg-white border-slate-200 focus:ring-amber-500 focus:border-amber-500" />
         </div>
         <Button variant="outline" className="border-slate-200 text-slate-600 bg-white hover:bg-slate-50">
            <Filter className="mr-2 h-4 w-4" />
            Filters
         </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl h-auto shadow-sm inline-flex w-full sm:w-auto overflow-x-auto">
            <TabsTrigger value="all" className="rounded-lg px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white font-medium text-slate-600">
                All ({allCourses.length})
            </TabsTrigger>
            <TabsTrigger value="published" className="rounded-lg px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white font-medium text-slate-600">
                Published ({publishedCourses.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-lg px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white font-medium text-slate-600">
                Pending ({pendingCourses.length})
            </TabsTrigger>
            <TabsTrigger value="drafts" className="rounded-lg px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white font-medium text-slate-600">
                Drafts ({draftCourses.length})
            </TabsTrigger>
            {rejectedCourses.length > 0 && (
                <TabsTrigger value="rejected" className="rounded-lg px-4 py-2 data-[state=active]:bg-amber-500 data-[state=active]:text-white font-medium text-slate-600">
                    Rejected ({rejectedCourses.length})
                </TabsTrigger>
            )}
        </TabsList>

        <TabsContent value="all" className="mt-0">
            <CourseList courseList={allCourses} />
        </TabsContent>
        <TabsContent value="published" className="mt-0">
            <CourseList courseList={publishedCourses} />
        </TabsContent>
        <TabsContent value="drafts" className="mt-0">
            <CourseList courseList={draftCourses} />
        </TabsContent>
        <TabsContent value="pending" className="mt-0">
            <CourseList courseList={pendingCourses} />
        </TabsContent>
        <TabsContent value="rejected" className="mt-0">
            <CourseList courseList={rejectedCourses} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
