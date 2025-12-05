import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CoursePlayer } from "@/components/courses/course-player"

async function getCourseData(slug: string, userId: string) {
  const supabase = await createClient()

  // Get course with modules and lessons
  const { data: course, error } = await supabase
    .from("courses")
    .select(`
      *,
      teacher:profiles!teacher_id(id, full_name, avatar_url),
      category:categories(id, name, slug)
    `)
    .eq("slug", slug)
    .single()

  if (error || !course) return null

  // Check enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("course_id", course.id)
    .eq("student_id", userId)
    .single()

  if (!enrollment) return null

  // Get modules with lessons
  const { data: modules } = await supabase
    .from("modules")
    .select(`
      *,
      lessons(*)
    `)
    .eq("course_id", course.id)
    .order("position")

  // Get lesson progress
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("course_id", course.id)
    .eq("student_id", userId)

  return {
    course: {
      ...course,
      modules:
        modules?.map((m) => ({
          ...m,
          lessons: m.lessons?.sort((a: { position: number }, b: { position: number }) => a.position - b.position) || [],
        })) || [],
    },
    enrollment,
    progress: progress || [],
  }
}

export default async function CoursePlayerPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/auth/login?redirect=/student/courses/${slug}`)
  }

  const data = await getCourseData(slug, user.id)
  if (!data) {
    notFound()
  }

  return <CoursePlayer course={data.course} enrollment={data.enrollment} progress={data.progress} userId={user.id} />
}
