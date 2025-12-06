import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap, BookOpen, Award, Users, Play, CheckCircle, ArrowRight, Star, Shield } from "lucide-react"
import { PublicNavbar } from "@/components/layout/public-navbar"
import { Footer } from "@/components/layout/footer"
import { createClient } from "@/lib/supabase/server"

async function getFeaturedCourses() {
  const supabase = await createClient()
  const { data } = await supabase
    .from("courses")
    .select(`
      *,
      teacher:profiles!teacher_id(full_name, avatar_url),
      category:categories(name, slug)
    `)
    .eq("status", "published")
    .eq("is_featured", true)
    .limit(6)
  return data || []
}

async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase.from("categories").select("*").limit(6)
  return data || []
}

async function getStats() {
  const supabase = await createClient()
  const { data: students } = await supabase.from("profiles").select("id", { count: "exact" }).eq("role", "student")

  const { data: courses } = await supabase.from("courses").select("id", { count: "exact" }).eq("status", "published")

  const { data: teachers } = await supabase
    .from("profiles")
    .select("id", { count: "exact" })
    .eq("role", "teacher")
    .eq("is_verified", true)

  return {
    students: students?.length || 0,
    courses: courses?.length || 0,
    teachers: teachers?.length || 0,
  }
}

export default async function HomePage() {
  const [featuredCourses, categories, stats] = await Promise.all([getFeaturedCourses(), getCategories(), getStats()])

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-5" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gold-500/10 px-4 py-2 text-gold-400">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Quality Controlled Learning</span>
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                A Modern School <span className="text-gold-400">Without Walls</span>
              </h1>
              <p className="mb-8 text-lg text-navy-200 sm:text-xl">
                Where knowledge is structured, quality is controlled, and excellence is the standard. Learn from
                verified experts and earn recognized certificates.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Button asChild size="lg" className="bg-gold-500 text-navy-900 hover:bg-gold-400">
                  <Link href="/courses">
                    Explore Courses
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-navy-400 text-white hover:bg-navy-800 bg-transparent"
                >
                  <Link href="/auth/sign-up">Start Learning Free</Link>
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-navy-700/50 shadow-2xl">
                <img
                  src="/students-learning-online-education-platform.jpg"
                  alt="Students learning on EduPlatform"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="flex h-20 w-20 items-center justify-center rounded-full bg-gold-500 text-navy-900 shadow-lg transition-transform hover:scale-110">
                    <Play className="ml-1 h-8 w-8" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary sm:text-4xl">{stats.students.toLocaleString()}+</div>
              <div className="mt-1 text-sm text-muted-foreground">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary sm:text-4xl">{stats.courses}+</div>
              <div className="mt-1 text-sm text-muted-foreground">Quality Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary sm:text-4xl">{stats.teachers}+</div>
              <div className="mt-1 text-sm text-muted-foreground">Expert Teachers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary sm:text-4xl">98%</div>
              <div className="mt-1 text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Why Choose <span className="text-primary">EduPlatform</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              We provide a controlled, quality-assured learning experience that sets us apart.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Quality Controlled</h3>
              <p className="text-muted-foreground">
                Every course goes through rigorous review before publishing. We maintain the highest standards.
              </p>
            </div>
            <div className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Verified Experts</h3>
              <p className="text-muted-foreground">
                All instructors are thoroughly vetted and verified. Learn from true industry professionals.
              </p>
            </div>
            <div className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Recognized Certificates</h3>
              <p className="text-muted-foreground">
                Earn certificates that validate your skills. Each certificate is uniquely numbered and verifiable.
              </p>
            </div>
            <div className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Structured Learning</h3>
              <p className="text-muted-foreground">
                Well-organized modules and lessons. Track your progress and learn at your own pace.
              </p>
            </div>
            <div className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Unified Platform</h3>
              <p className="text-muted-foreground">
                One brand, one standard. No scattered experiences across multiple platforms.
              </p>
            </div>
            <div className="group rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Progress Tracking</h3>
              <p className="text-muted-foreground">
                Monitor your learning journey with detailed analytics and completion tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Browse by Category</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Explore our diverse range of courses across various disciplines.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/courses?category=${category.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <BookOpen className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg">
              <Link href="/courses">
                View All Categories
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      {featuredCourses.length > 0 && (
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Featured Courses</h2>
                <p className="mt-2 text-lg text-muted-foreground">Hand-picked courses by our team of experts.</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/courses">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="card-hover group overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div className="aspect-video overflow-hidden bg-muted">
                    <img
                      src={
                        course.thumbnail_url ||
                        `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(course.title)}`
                      }
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {course.category?.name || "General"}
                      </span>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium capitalize text-muted-foreground">
                        {course.level}
                      </span>
                    </div>
                    <h3 className="mb-2 line-clamp-2 text-lg font-semibold group-hover:text-primary">{course.title}</h3>
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{course.short_description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 overflow-hidden rounded-full bg-muted">
                          <img
                            src={course.teacher?.avatar_url || `/placeholder.svg?height=32&width=32&query=avatar`}
                            alt={course.teacher?.full_name || "Instructor"}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {course.teacher?.full_name || "Instructor"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gold-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm font-medium">{course.average_rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <span className="text-2xl font-bold text-primary">
                        {course.price === 0 ? "Free" : `₦${course.price.toLocaleString()}`}
                      </span>
                      <span className="text-sm text-muted-foreground">{course.enrollment_count} enrolled</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-200">
            Join thousands of students already learning on EduPlatform. Get access to quality courses, expert
            instructors, and recognized certificates.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="bg-gold-500 text-navy-900 hover:bg-gold-400">
              <Link href="/auth/sign-up">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-navy-400 text-white hover:bg-navy-800 bg-transparent"
            >
              <Link href="/become-teacher">Become a Teacher</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
