"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface ActionResponse {
  success: boolean
  error?: string
  data?: any
}

// Fetch all teachers with proper error handling
export async function getTeachers(): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    // First verify the user is authenticated and is an admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get the admin's profile to verify role
    const { data: adminProfile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || adminProfile?.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin access required" }
    }

    // Fetch all teachers
    const { data: teachers, error: teachersError } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        avatar_url,
        bio,
        phone,
        is_verified,
        verification_status,
        role,
        created_at,
        updated_at
      `)
      .eq("role", "teacher")
      .order("created_at", { ascending: false })

    if (teachersError) {
      console.error("[v0] Error fetching teachers:", teachersError)
      return { success: false, error: teachersError.message }
    }

    // Fetch course counts for each teacher
    const teacherIds = teachers?.map((t) => t.id) || []

    if (teacherIds.length > 0) {
      const { data: courseCounts } = await supabase.from("courses").select("teacher_id").in("teacher_id", teacherIds)

      // Count courses per teacher
      const courseCountMap: Record<string, number> = {}
      courseCounts?.forEach((c) => {
        courseCountMap[c.teacher_id] = (courseCountMap[c.teacher_id] || 0) + 1
      })

      // Add course count to teachers
      const teachersWithCounts = teachers?.map((t) => ({
        ...t,
        course_count: courseCountMap[t.id] || 0,
      }))

      return { success: true, data: teachersWithCounts }
    }

    return { success: true, data: teachers || [] }
  } catch (error: any) {
    console.error("[v0] Unexpected error in getTeachers:", error)
    return { success: false, error: error.message }
  }
}

// Verify a teacher
export async function verifyTeacher(teacherId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get admin profile
    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (adminProfile?.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin access required" }
    }

    // Update teacher profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        is_verified: true,
        verification_status: "verified",
        updated_at: new Date().toISOString(),
      })
      .eq("id", teacherId)
      .eq("role", "teacher")

    if (updateError) {
      console.error("[v0] Error verifying teacher:", updateError)
      return { success: false, error: updateError.message }
    }

    // Update teacher application if exists
    await supabase
      .from("teacher_applications")
      .update({
        status: "approved",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("user_id", teacherId)

    // Log admin action
    await supabase.from("admin_logs").insert({
      admin_id: user.id,
      action: "teacher_verified",
      entity_type: "teacher",
      entity_id: teacherId,
      details: { action: "Teacher verified and approved" },
    })

    // Create notification for teacher
    await supabase.from("notifications").insert({
      user_id: teacherId,
      title: "Account Verified",
      message: "Congratulations! Your teacher account has been verified. You can now create and publish courses.",
      type: "success",
      link: "/teacher",
    })

    revalidatePath("/admin/teachers")
    revalidatePath(`/admin/teachers/${teacherId}`)

    return { success: true, data: { message: "Teacher verified successfully" } }
  } catch (error: any) {
    console.error("[v0] Unexpected error in verifyTeacher:", error)
    return { success: false, error: error.message }
  }
}

// Reject a teacher application
export async function rejectTeacher(teacherId: string, reason: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get admin profile
    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (adminProfile?.role !== "admin") {
      return { success: false, error: "Unauthorized - Admin access required" }
    }

    if (!reason.trim()) {
      return { success: false, error: "Rejection reason is required" }
    }

    // Update teacher application
    const { error: appError } = await supabase
      .from("teacher_applications")
      .update({
        status: "rejected",
        rejection_reason: reason,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("user_id", teacherId)

    if (appError) {
      console.error("[v0] Error rejecting application:", appError)
    }

    // Update profile verification status
    await supabase
      .from("profiles")
      .update({
        verification_status: "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", teacherId)

    // Log admin action
    await supabase.from("admin_logs").insert({
      admin_id: user.id,
      action: "teacher_rejected",
      entity_type: "teacher",
      entity_id: teacherId,
      details: { reason },
    })

    // Create notification for teacher
    await supabase.from("notifications").insert({
      user_id: teacherId,
      title: "Application Update",
      message: `Your teacher application was not approved. Reason: ${reason}`,
      type: "warning",
      link: "/become-teacher",
    })

    revalidatePath("/admin/teachers")

    return { success: true, data: { message: "Application rejected" } }
  } catch (error: any) {
    console.error("[v0] Unexpected error in rejectTeacher:", error)
    return { success: false, error: error.message }
  }
}

// Get single teacher details
export async function getTeacherDetails(teacherId: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return { success: false, error: "Not authenticated" }
    }

    // Fetch teacher profile
    const { data: teacher, error: teacherError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", teacherId)
      .eq("role", "teacher")
      .single()

    if (teacherError || !teacher) {
      return { success: false, error: "Teacher not found" }
    }

    // Fetch teacher's courses
    const { data: courses } = await supabase
      .from("courses")
      .select(`
        id,
        title,
        status,
        enrollment_count,
        created_at
      `)
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false })

    // Fetch teacher application
    const { data: application } = await supabase
      .from("teacher_applications")
      .select("*")
      .eq("user_id", teacherId)
      .single()

    return {
      success: true,
      data: {
        teacher,
        courses: courses || [],
        application,
      },
    }
  } catch (error: any) {
    console.error("[v0] Unexpected error in getTeacherDetails:", error)
    return { success: false, error: error.message }
  }
}
