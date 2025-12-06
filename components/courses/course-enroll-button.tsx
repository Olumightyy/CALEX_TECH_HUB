"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Play, ShoppingCart } from "lucide-react"
import type { Course, Enrollment } from "@/lib/types/database"

interface CourseEnrollButtonProps {
  course: Course
  enrollment: Enrollment | null
}

export function CourseEnrollButton({ course, enrollment }: CourseEnrollButtonProps) {
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()

    async function checkUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      setUser(authUser ? { id: authUser.id } : null)
      setCheckingAuth(false)
    }

    checkUser()
  }, [])

  const handleEnroll = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/courses/${course.slug}`)
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      if (course.price === 0) {
        // Free course - enroll directly
        const { error } = await supabase.from("enrollments").insert({
          student_id: user.id,
          course_id: course.id,
          status: "active",
        })

        if (error) throw error
        router.push(`/student/courses/${course.slug}`)
        router.refresh()
      } else {
        // Paid course - redirect to checkout
        router.push(`/checkout/${course.slug}`)
      }
    } catch (error) {
      console.error("Enrollment error:", error)
      alert("Failed to enroll. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    )
  }

  if (enrollment) {
    return (
      <Button asChild className="w-full bg-green-600 hover:bg-green-700">
        <a href={`/student/courses/${course.slug}`}>
          <Play className="mr-2 h-4 w-4" />
          Continue Learning
        </a>
      </Button>
    )
  }

  return (
    <Button onClick={handleEnroll} disabled={loading} className="w-full" size="lg">
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : course.price === 0 ? (
        <>
          <Play className="mr-2 h-4 w-4" />
          Enroll for Free
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Enroll Now
        </>
      )}
    </Button>
  )
}
