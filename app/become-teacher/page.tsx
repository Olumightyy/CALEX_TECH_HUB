"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PublicNavbar } from "@/components/layout/public-navbar"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { GraduationCap, CheckCircle, Users, TrendingUp, Award, Loader2, ArrowRight } from "lucide-react"

export default function BecomeTeacherPage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [existingApplication, setExistingApplication] = useState<{ status: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    expertise: "",
    experienceYears: "",
    qualifications: "",
    portfolioUrl: "",
    linkedinUrl: "",
    bio: "",
    reason: "",
  })

  useEffect(() => {
    const supabase = createClient()

    async function checkUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        setUser({ id: authUser.id, email: authUser.email || "" })
        setFormData((prev) => ({ ...prev, email: authUser.email || "" }))

        // Check for existing application
        const { data: application } = await supabase
          .from("teacher_applications")
          .select("status")
          .eq("user_id", authUser.id)
          .single()

        if (application) {
          setExistingApplication(application)
        }

        // Get profile for name
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", authUser.id)
          .single()

        if (profile) {
          if (profile.role === "teacher") {
            router.push("/teacher")
            return
          }
          setFormData((prev) => ({ ...prev, fullName: profile.full_name || "" }))
        }
      }
      setLoading(false)
    }

    checkUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      router.push("/auth/sign-up")
      return
    }

    const supabase = createClient()
    setSubmitting(true)
    setError(null)

    try {
      const { error: insertError } = await supabase.from("teacher_applications").insert({
        user_id: user.id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
        expertise: formData.expertise,
        experience_years: formData.experienceYears ? Number.parseInt(formData.experienceYears) : null,
        qualifications: formData.qualifications || null,
        portfolio_url: formData.portfolioUrl || null,
        linkedin_url: formData.linkedinUrl || null,
        bio: formData.bio,
        reason: formData.reason,
      })

      if (insertError) throw insertError
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit application")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (success || existingApplication) {
    const status = existingApplication?.status || "pending"
    return (
      <div className="flex min-h-screen flex-col">
        <PublicNavbar />
        <main className="flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div
                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
                  status === "approved" ? "bg-green-100" : status === "rejected" ? "bg-red-100" : "bg-gold-100"
                }`}
              >
                {status === "approved" ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : status === "rejected" ? (
                  <CheckCircle className="h-8 w-8 text-red-600" />
                ) : (
                  <GraduationCap className="h-8 w-8 text-gold-600" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {status === "approved"
                  ? "You're Approved!"
                  : status === "rejected"
                    ? "Application Not Approved"
                    : "Application Submitted!"}
              </CardTitle>
              <CardDescription>
                {status === "approved"
                  ? "You can now access your teacher dashboard and create courses."
                  : status === "rejected"
                    ? "Unfortunately, your application was not approved. You can contact support for more information."
                    : "We'll review your application and get back to you within 2-3 business days."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {status === "approved" ? (
                <Button asChild className="w-full">
                  <Link href="/teacher">
                    Go to Teacher Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="outline" className="w-full bg-transparent">
                  <Link href="/">Back to Home</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">Share Your Knowledge with the World</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-200">
            Join our community of verified experts and help students achieve their goals. Create impactful courses and
            reach thousands of learners.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Reach More Students</h3>
              <p className="text-muted-foreground">
                Access our growing community of motivated learners looking for quality education.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Track Performance</h3>
              <p className="text-muted-foreground">
                Get detailed analytics on student engagement, course completion, and feedback.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Award className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Build Your Brand</h3>
              <p className="text-muted-foreground">
                Establish yourself as an authority in your field with a verified instructor profile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="bg-muted/50 py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Application</CardTitle>
              <CardDescription>
                Fill out the form below to apply as an instructor.
                {!user && " You'll need to create an account first."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!user ? (
                <div className="text-center">
                  <p className="mb-4 text-muted-foreground">
                    Please create an account or sign in to submit your application.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button asChild>
                      <Link href="/auth/sign-up">Create Account</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/auth/login">Sign In</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experienceYears">Years of Experience</Label>
                      <Input
                        id="experienceYears"
                        type="number"
                        min="0"
                        value={formData.experienceYears}
                        onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expertise">Area of Expertise *</Label>
                    <Input
                      id="expertise"
                      required
                      placeholder="e.g., Web Development, Data Science, Marketing"
                      value={formData.expertise}
                      onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualifications">Qualifications & Certifications</Label>
                    <Textarea
                      id="qualifications"
                      placeholder="List your relevant degrees, certifications, and achievements"
                      value={formData.qualifications}
                      onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                    />
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="portfolioUrl">Portfolio/Website URL</Label>
                      <Input
                        id="portfolioUrl"
                        type="url"
                        placeholder="https://"
                        value={formData.portfolioUrl}
                        onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                      <Input
                        id="linkedinUrl"
                        type="url"
                        placeholder="https://linkedin.com/in/"
                        value={formData.linkedinUrl}
                        onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Bio *</Label>
                    <Textarea
                      id="bio"
                      required
                      rows={4}
                      placeholder="Tell us about your background and what makes you qualified to teach"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Why do you want to teach on EduPlatform? *</Label>
                    <Textarea
                      id="reason"
                      required
                      rows={3}
                      placeholder="Share your motivation and what courses you'd like to create"
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    />
                  </div>

                  {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
