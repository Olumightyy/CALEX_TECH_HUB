import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { CourseList } from "@/components/teacher/course-list"

export default async function TeacherCoursesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: courses } = await supabase
    .from("courses")
    .select(`
      *,
      enrollments(count),
      modules(count),
      categories(name)
    `)
    .eq("teacher_id", user?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
          <p className="text-muted-foreground mt-1">Manage and organize all your courses</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/teacher/courses/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Course
          </Link>
        </Button>
      </div>

      <CourseList courses={courses || []} />
    </div>
  )
}
