import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  BookOpen,
  Award,
  Users,
  Play,
  CheckCircle,
  ArrowRight,
  Star,
  Shield,
  Sparkles,
  TrendingUp,
  Clock,
  Globe,
} from "lucide-react"
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
  const { data } = await supabase.from("categories").select("*").limit(8)
  return data || []
}

async function getStats() {
  const supabase = await createClient()
  const { count: students } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "student")
  const { count: courses } = await supabase
    .from("courses")
    .select("id", { count: "exact", head: true })
    .eq("status", "published")
  const { count: teachers } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "teacher")
    .eq("is_verified", true)

  return {
    students: students || 0,
    courses: courses || 0,
    teachers: teachers || 0,
  }
}

export default async function HomePage() {
  const [featuredCourses, categories, stats] = await Promise.all([getFeaturedCourses(), getCategories(), getStats()])

  const features = [
    {
      icon: Shield,
      title: "Quality Assured",
      description: "Every course undergoes rigorous review. We maintain the highest educational standards.",
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      icon: GraduationCap,
      title: "Expert Instructors",
      description: "Learn from verified industry professionals with proven track records.",
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      icon: Award,
      title: "Recognized Certificates",
      description: "Earn certificates that validate your skills. Verifiable and industry-recognized.",
      color: "text-amber-600",
      bg: "bg-amber-500/10",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your learning journey with detailed analytics and milestone tracking.",
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    },
    {
      icon: Globe,
      title: "Learn Anywhere",
      description: "Access courses on any device. Learn at your own pace, anytime, anywhere.",
      color: "text-rose-600",
      bg: "bg-rose-500/10",
    },
    {
      icon: Users,
      title: "Unified Platform",
      description: "One brand, one standard. A consistent learning experience throughout.",
      color: "text-indigo-600",
      bg: "bg-indigo-500/10",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,58,95,0.15),transparent)]" />
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-[0.02]" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-accent-foreground">Trusted by 10,000+ learners</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                A Modern School
                <span className="relative ml-3 whitespace-nowrap">
                  <span className="relative text-primary">Without Walls</span>
                  <svg className="absolute -bottom-2 left-0 h-3 w-full text-accent/40" viewBox="0 0 200 12" fill="none">
                    <path d="M2 10C50 4 150 4 198 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Where knowledge is structured, quality is controlled, and excellence is the standard. Learn from
                verified experts and earn recognized certificates.
              </p>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="h-14 rounded-xl bg-primary px-8 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40"
                >
                  <Link href="/courses">
                    Explore Courses
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-14 rounded-xl border-2 px-8 text-base font-semibold bg-transparent"
                >
                  <Link href="/auth/sign-up">Start Learning Free</Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 lg:justify-start">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">Join 10,000+ students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-sm font-medium text-foreground">4.9/5</span>
                  <span className="text-sm text-muted-foreground">(2,000+ reviews)</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Main Card */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10">
                  <img
                    src="/students-learning-online-modern-classroom.jpg"
                    alt="Students learning on EduPlatform"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Play Button */}
                  <button className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl transition-transform hover:scale-110">
                    <Play className="ml-1 h-8 w-8" />
                  </button>

                  {/* Bottom Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <Badge className="mb-2 bg-accent text-accent-foreground">Most Popular</Badge>
                    <h3 className="text-xl font-semibold text-white">Complete Web Development Bootcamp</h3>
                    <p className="mt-1 text-sm text-white/80">Join 5,000+ students in this comprehensive course</p>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -left-8 -top-6 rounded-xl border border-border bg-card p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Certificate Earned!</p>
                      <p className="text-xs text-muted-foreground">Web Development</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-6 rounded-xl border border-border bg-card p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">85%</p>
                      <p className="text-xs text-muted-foreground">Course Progress</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { label: "Active Students", value: `${stats.students.toLocaleString()}+`, icon: Users },
              { label: "Quality Courses", value: `${stats.courses}+`, icon: BookOpen },
              { label: "Expert Teachers", value: `${stats.teachers}+`, icon: GraduationCap },
              { label: "Satisfaction Rate", value: "98%", icon: Star },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground sm:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="secondary" className="mb-4">
              Why Choose Us
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to succeed
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We provide a controlled, quality-assured learning experience that sets us apart from traditional
              platforms.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-border bg-card p-8 transition-all hover:border-primary/30 hover:shadow-lg"
              >
                <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl ${feature.bg}`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{feature.description}</p>

                {/* Hover arrow */}
                <ArrowRight className="absolute bottom-8 right-8 h-5 w-5 text-muted-foreground/0 transition-all group-hover:text-primary group-hover:translate-x-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <Badge variant="secondary" className="mb-4">
                Categories
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Browse by Category</h2>
              <p className="mt-2 text-lg text-muted-foreground">
                Explore our diverse range of courses across disciplines.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-xl bg-transparent">
              <Link href="/courses">
                View All Categories
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, index) => {
              const colors = [
                { bg: "bg-blue-500/10", text: "text-blue-600", hover: "hover:border-blue-500/30" },
                { bg: "bg-emerald-500/10", text: "text-emerald-600", hover: "hover:border-emerald-500/30" },
                { bg: "bg-purple-500/10", text: "text-purple-600", hover: "hover:border-purple-500/30" },
                { bg: "bg-amber-500/10", text: "text-amber-600", hover: "hover:border-amber-500/30" },
                { bg: "bg-rose-500/10", text: "text-rose-600", hover: "hover:border-rose-500/30" },
                { bg: "bg-indigo-500/10", text: "text-indigo-600", hover: "hover:border-indigo-500/30" },
                { bg: "bg-teal-500/10", text: "text-teal-600", hover: "hover:border-teal-500/30" },
                { bg: "bg-orange-500/10", text: "text-orange-600", hover: "hover:border-orange-500/30" },
              ]
              const color = colors[index % colors.length]

              return (
                <Link
                  key={category.id}
                  href={`/courses?category=${category.slug}`}
                  className={`group flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md ${color.hover}`}
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl ${color.bg} transition-transform group-hover:scale-110`}
                  >
                    <BookOpen className={`h-6 w-6 ${color.text}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{category.name}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">{category.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      {featuredCourses.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div>
                <Badge variant="secondary" className="mb-4">
                  Featured
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Top-rated Courses</h2>
                <p className="mt-2 text-lg text-muted-foreground">Hand-picked courses by our team of experts.</p>
              </div>
              <Button asChild variant="outline" className="rounded-xl bg-transparent">
                <Link href="/courses">
                  View All Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-xl card-hover"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    <img
                      src={
                        course.thumbnail_url ||
                        `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(course.title)}`
                      }
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {course.is_featured && (
                      <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground">Featured</Badge>
                    )}
                    {course.price === 0 && (
                      <Badge className="absolute right-3 top-3 bg-emerald-500 text-white">Free</Badge>
                    )}

                    {/* Duration Badge */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
                      <Clock className="h-3 w-3" />
                      {Math.floor(course.total_duration / 60)}h {course.total_duration % 60}m
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Category & Level */}
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="rounded-md text-xs">
                        {course.category?.name || "General"}
                      </Badge>
                      <Badge variant="outline" className="rounded-md text-xs capitalize">
                        {course.level}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
                      {course.title}
                    </h3>

                    {/* Description */}
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{course.short_description}</p>

                    {/* Teacher */}
                    <div className="flex items-center justify-between border-t border-border pt-4">
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
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold">{course.average_rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Price & Stats */}
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <span className="text-2xl font-bold text-primary">
                        {course.price === 0 ? "Free" : `₦${course.price.toLocaleString()}`}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {course.enrollment_count.toLocaleString()} enrolled
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-primary py-20 sm:py-28">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1),transparent)]" />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Badge className="mb-6 border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">
            Start Today
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/80">
            Join thousands of students already learning on EduPlatform. Get access to quality courses, expert
            instructors, and recognized certificates.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="h-14 rounded-xl bg-accent px-8 text-base font-semibold text-accent-foreground shadow-lg transition-all hover:bg-accent/90"
            >
              <Link href="/auth/sign-up">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 rounded-xl border-2 border-primary-foreground/20 bg-transparent px-8 text-base font-semibold text-primary-foreground hover:bg-primary-foreground/10"
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
