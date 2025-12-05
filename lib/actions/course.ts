"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type DeleteCourseResult = {
  success: boolean
  error?: string
}

export async function deleteCourse(courseId: string): Promise<DeleteCourseResult> {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "You must be logged in to delete a course" }
    }

    // Verify the user is a teacher and owns this course
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, title, teacher_id, status")
      .eq("id", courseId)
      .single()

    if (courseError || !course) {
      return { success: false, error: "Course not found" }
    }

    // Check ownership
    if (course.teacher_id !== user.id) {
      return { success: false, error: "You do not have permission to delete this course" }
    }

    // Check if course has active enrollments
    const { count: enrollmentCount } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("course_id", courseId)
      .eq("status", "active")

    if (enrollmentCount && enrollmentCount > 0) {
      return {
        success: false,
        error: `Cannot delete course with ${enrollmentCount} active enrollment(s). Please contact an administrator.`,
      }
    }

    // Delete related records in order (due to foreign key constraints)
    // 1. Delete quiz attempts
    const { data: quizzes } = await supabase.from("quizzes").select("id").eq("course_id", courseId)

    if (quizzes && quizzes.length > 0) {
      const quizIds = quizzes.map((q) => q.id)
      await supabase.from("quiz_attempts").delete().in("quiz_id", quizIds)
      await supabase.from("quiz_questions").delete().in("quiz_id", quizIds)
    }

    // 2. Delete quizzes
    await supabase.from("quizzes").delete().eq("course_id", courseId)

    // 3. Delete lesson progress
    await supabase.from("lesson_progress").delete().eq("course_id", courseId)

    // 4. Delete lessons
    await supabase.from("lessons").delete().eq("course_id", courseId)

    // 5. Delete modules
    await supabase.from("modules").delete().eq("course_id", courseId)

    // 6. Delete announcements
    await supabase.from("announcements").delete().eq("course_id", courseId)

    // 7. Delete reviews
    await supabase.from("reviews").delete().eq("course_id", courseId)

    // 8. Delete certificates (only if no active enrollments)
    await supabase.from("certificates").delete().eq("course_id", courseId)

    // 9. Delete enrollments (inactive ones)
    await supabase.from("enrollments").delete().eq("course_id", courseId)

    // 10. Delete payments (if needed based on your business logic)
    // Note: You might want to keep payment records for auditing
    // await supabase.from("payments").delete().eq("course_id", courseId)

    // 11. Finally delete the course
    const { error: deleteError } = await supabase.from("courses").delete().eq("id", courseId)

    if (deleteError) {
      console.error("[v0] Error deleting course:", deleteError)
      return { success: false, error: deleteError.message }
    }

    // Revalidate the teacher courses page
    revalidatePath("/teacher/courses")
    revalidatePath("/courses")

    return { success: true }
  } catch (error) {
    console.error("[v0] Unexpected error deleting course:", error)
    return { success: false, error: "An unexpected error occurred while deleting the course" }
  }
}
