import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GraduationCap, BookOpen, Award, Users, Play, CheckCircle, ArrowRight, Star, Shield } from "lucide-react"
import { PublicLayout } from "@/components/layouts/public-layout"
import { createClient } from "@/lib/supabase/server"

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch Stats
  const { count: studentCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student')
  const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true }).eq('status', 'published')
  const { count: teacherCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher')

  const stats = {
    students: studentCount || 0,
    courses: courseCount || 0,
    teachers: teacherCount || 0
  };

  // Fetch Featured Courses
  const { data: featuredCourses } = await supabase
    .from('courses')
    .select(`
      *,
      teacher:profiles!teacher_id(full_name, avatar_url),
      category:categories(name, slug)
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .limit(3)

  // Fetch Categories
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .limit(6)

  const getCategoryIcon = (slug: string) => {
    if (slug.includes('dev')) return BookOpen
    if (slug.includes('bus')) return Users
    if (slug.includes('des')) return Award
    return BookOpen
  }

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 px-4 py-24 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 opacity-90" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-2 text-amber-400 border border-amber-500/20">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Quality Controlled Learning</span>
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
                A Modern School <span className="text-amber-500">Without Walls</span>
              </h1>
              <p className="mb-8 text-lg text-slate-300 sm:text-xl">
                Where knowledge is structured, quality is controlled, and excellence is the standard. Learn from
                verified experts and earn recognized certificates.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <Button asChild size="lg" className="bg-amber-500 text-slate-950 hover:bg-amber-400 font-semibold shadow-lg shadow-amber-500/20">
                  <Link href="/courses">
                    Explore Courses
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-slate-700 text-white hover:bg-slate-800 bg-transparent"
                >
                  <Link href="/auth/sign-up">Start Learning Free</Link>
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-800 shadow-2xl border border-slate-700">
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <button className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/90 text-slate-950 shadow-lg transition-transform hover:scale-110 hover:bg-amber-400">
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
              <div className="text-3xl font-bold text-slate-900 sm:text-4xl">{stats.students.toLocaleString()}+</div>
              <div className="mt-1 text-sm text-muted-foreground">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 sm:text-4xl">{stats.courses}+</div>
              <div className="mt-1 text-sm text-muted-foreground">Quality Courses</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 sm:text-4xl">{stats.teachers}+</div>
              <div className="mt-1 text-sm text-muted-foreground">Expert Teachers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900 sm:text-4xl">98%</div>
              <div className="mt-1 text-sm text-muted-foreground">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Why Choose <span className="text-amber-600">EduPlatform</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              We provide a controlled, quality-assured learning experience that sets us apart.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Quality Controlled", desc: "Every course goes through rigorous review before publishing.", icon: Shield },
              { title: "Verified Experts", desc: "All instructors are thoroughly vetted and verified.", icon: GraduationCap },
              { title: "Recognized Certificates", desc: "Earn certificates that validate your skills.", icon: Award },
              { title: "Structured Learning", desc: "Well-organized modules and lessons.", icon: BookOpen },
              { title: "Unified Platform", desc: "One brand, one standard. No scattered experiences.", icon: Users },
              { title: "Progress Tracking", desc: "Monitor your learning journey with detailed analytics.", icon: CheckCircle },
            ].map((feature, idx) => (
              <div key={idx} className="group rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:border-amber-500/50 hover:shadow-xl hover:-translate-y-1">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-slate-600">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Browse by Category</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Explore our diverse range of courses across various disciplines.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categoriesData?.map((category) => {
              const Icon = getCategoryIcon(category.slug || "")
              return (
              <Link
                key={category.id}
                href={`/courses?category=${category.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-amber-500/50 hover:shadow-lg hover:bg-slate-50"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{category.name}</h3>
                  <p className="text-sm text-slate-500">{category.description || "Explore courses in this category"}</p>
                </div>
              </Link>
            )})}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="outline" size="lg" className="border-slate-300">
              <Link href="/courses">
                View All Categories
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Featured Courses</h2>
              <p className="mt-2 text-lg text-slate-600">Hand-picked courses by our team of experts.</p>
            </div>
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link href="/courses">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses?.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-video overflow-hidden bg-slate-200 relative">
                  {course.thumbnail_url ? (
                    <img src={course.thumbnail_url} alt={course.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                       <BookOpen className="h-10 w-10 opacity-20" />
                    </div>
                  )}
                  {/* Overlay for hover */}
                   <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10" />
                </div>
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                      {course.category?.name || "General"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {course.level}
                    </span>
                  </div>
                  <h3 className="mb-2 line-clamp-2 text-lg font-bold text-slate-900 group-hover:text-amber-600 transition-colors">{course.title}</h3>
                  <p className="mb-4 line-clamp-2 text-sm text-slate-500">{course.short_description || course.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-200 flex items-center justify-center">
                         {(course.teacher as any)?.avatar_url ? (
                            <img src={(course.teacher as any).avatar_url} alt={(course.teacher as any).full_name} className="h-full w-full object-cover"/>
                         ) : (
                            <Users className="h-4 w-4 text-slate-400" />
                         )}
                      </div>
                      <span className="text-sm text-slate-600 font-medium">
                        {(course.teacher as any)?.full_name || "Instructor"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-bold">{course.average_rating?.toFixed(1) || "New"}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xl font-bold text-slate-900">
                      {course.price === 0 ? "Free" : `₦${course.price.toLocaleString()}`}
                    </span>
                    <span className="text-sm text-slate-500">{course.enrollment_count} enrolled</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-slate-900 py-20 relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-indigo-950 opacity-50" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 z-10">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            Join thousands of students already learning on EduPlatform. Get access to quality courses, expert
            instructors, and recognized certificates.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="bg-amber-500 text-slate-900 hover:bg-amber-400 font-bold">
              <Link href="/auth/sign-up">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-800 bg-transparent"
            >
              <Link href="/become-teacher">Become a Teacher</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
