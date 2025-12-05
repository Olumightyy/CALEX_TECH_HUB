import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { GraduationCap, Shield, Clock, Award } from "lucide-react"
import Link from "next/link"

async function getCourse(slug: string) {
  const supabase = await createClient()

  const { data: course, error } = await supabase
    .from("courses")
    .select(`
      *,
      teacher:profiles!teacher_id(full_name)
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error || !course) return null
  return course
}

export default async function CheckoutPage({
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
    redirect(`/auth/login?redirect=/checkout/${slug}`)
  }

  const course = await getCourse(slug)
  if (!course) {
    notFound()
  }

  // Check if already enrolled
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("course_id", course.id)
    .eq("student_id", user.id)
    .single()

  if (enrollment) {
    redirect(`/student/courses/${slug}`)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Checkout Form */}
      <div className="flex flex-1 flex-col px-4 py-12 sm:px-6 lg:px-12">
        <div className="mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">EduPlatform</span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-lg">
          <h1 className="mb-2 text-2xl font-bold">Complete your purchase</h1>
          <p className="mb-8 text-muted-foreground">
            You&apos;re enrolling in: <strong>{course.title}</strong>
          </p>

          <CheckoutForm course={course} userId={user.id} />

          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Secure payment</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Instant access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Order Summary */}
      <div className="hidden w-[400px] bg-muted/50 p-12 lg:block">
        <div className="sticky top-12">
          <h2 className="mb-6 text-lg font-semibold">Order Summary</h2>

          <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card">
            <div className="aspect-video bg-muted">
              <img
                src={
                  course.thumbnail_url ||
                  `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(course.title)}`
                }
                alt={course.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="mb-1 font-semibold">{course.title}</h3>
              <p className="text-sm text-muted-foreground">by {course.teacher?.full_name}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Course price</span>
              <span>₦{course.price.toLocaleString()}</span>
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-2xl font-bold">₦{course.price.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>Certificate of completion included</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Lifetime access to course content</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
