import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PublicNavbar } from "@/components/layout/public-navbar"
import { Footer } from "@/components/layout/footer"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CourseEnrollButton } from "@/components/courses/course-enroll-button"
import {
  Star,
  Users,
  Clock,
  BookOpen,
  Award,
  CheckCircle,
  Play,
  FileText,
  Globe,
  BarChart3,
  Shield,
} from "lucide-react"

async function getCourse(slug: string) {
  const supabase = await createClient()

  const { data: course, error } = await supabase
    .from("courses")
    .select(`
      *,
      teacher:profiles!teacher_id(id, full_name, avatar_url, bio),
      category:categories(id, name, slug)
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single()

  if (error || !course) return null

  // Get modules with lessons
  const { data: modules } = await supabase
    .from("modules")
    .select(`
      *,
      lessons(id, title, content_type, duration, is_preview, position)
    `)
    .eq("course_id", course.id)
    .order("position")

  // Get reviews
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      *,
      student:profiles!student_id(full_name, avatar_url)
    `)
    .eq("course_id", course.id)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(10)

  return {
    ...course,
    modules:
      modules?.map((m) => ({
        ...m,
        lessons: m.lessons?.sort((a: { position: number }, b: { position: number }) => a.position - b.position) || [],
      })) || [],
    reviews: reviews || [],
  }
}

async function checkEnrollment(courseId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("course_id", courseId)
    .eq("student_id", user.id)
    .single()

  return enrollment
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const course = await getCourse(slug)

  if (!course) {
    notFound()
  }

  const enrollment = await checkEnrollment(course.id)

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins} minutes`
    if (mins === 0) return `${hours} hours`
    return `${hours}h ${mins}m`
  }

  const totalLessons = course.modules.reduce(
    (acc: number, m: { lessons: unknown[] }) => acc + (m.lessons?.length || 0),
    0,
  )

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Course Info */}
            <div className="lg:col-span-2">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {course.category && (
                  <Badge className="bg-gold-500/20 text-gold-400 hover:bg-gold-500/30">{course.category.name}</Badge>
                )}
                <Badge variant="outline" className="border-navy-400 capitalize text-navy-200">
                  {course.level}
                </Badge>
                {course.is_featured && <Badge className="bg-gold-500 text-navy-900">Featured</Badge>}
              </div>

              <h1 className="mb-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{course.title}</h1>

              <p className="mb-6 text-lg text-navy-200">{course.short_description || course.description}</p>

              {/* Stats */}
              <div className="mb-6 flex flex-wrap items-center gap-6 text-navy-200">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-gold-400 text-gold-400" />
                  <span className="font-semibold text-white">{course.average_rating.toFixed(1)}</span>
                  <span>({course.review_count} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{course.enrollment_count} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{formatDuration(course.total_duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>{totalLessons} lessons</span>
                </div>
              </div>

              {/* Teacher */}
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full bg-navy-700">
                  <img
                    src={course.teacher?.avatar_url || `/placeholder.svg?height=48&width=48&query=avatar`}
                    alt={course.teacher?.full_name || "Instructor"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm text-navy-300">Created by</p>
                  <p className="font-semibold text-white">{course.teacher?.full_name}</p>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="lg:col-span-1">
              <div className="overflow-hidden rounded-xl bg-card shadow-2xl">
                {/* Preview Video/Image */}
                <div className="relative aspect-video bg-muted">
                  <img
                    src={
                      course.thumbnail_url ||
                      `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(course.title)}`
                    }
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                  {course.preview_video_url && (
                    <button className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-primary">
                        <Play className="ml-1 h-6 w-6" />
                      </div>
                    </button>
                  )}
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-foreground">
                      {course.price === 0 ? "Free" : `₦${course.price.toLocaleString()}`}
                    </span>
                  </div>

                  <CourseEnrollButton course={course} enrollment={enrollment} />

                  {/* Course Features */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDuration(course.total_duration)} of content</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>{course.language}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{course.level} level</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>Lifetime access</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-8 w-full justify-start">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                  <TabsTrigger value="instructor">Instructor</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8">
                  {/* Description */}
                  <div>
                    <h2 className="mb-4 text-2xl font-bold">About this course</h2>
                    <div className="prose prose-gray max-w-none text-muted-foreground">
                      <p>{course.description}</p>
                    </div>
                  </div>

                  {/* What you'll learn */}
                  {course.objectives && course.objectives.length > 0 && (
                    <div className="rounded-xl border border-border bg-card p-6">
                      <h3 className="mb-4 text-lg font-semibold">What you&apos;ll learn</h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {course.objectives.map((objective: string, index: number) => (
                          <div key={index} className="flex gap-3">
                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                            <span className="text-sm">{objective}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requirements */}
                  {course.requirements && course.requirements.length > 0 && (
                    <div>
                      <h3 className="mb-4 text-lg font-semibold">Requirements</h3>
                      <ul className="space-y-2">
                        {course.requirements.map((req: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-muted-foreground">
                            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tags */}
                  {course.tags && course.tags.length > 0 && (
                    <div>
                      <h3 className="mb-4 text-lg font-semibold">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="curriculum">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">Course Curriculum</h2>
                      <p className="text-sm text-muted-foreground">
                        {course.modules.length} modules • {totalLessons} lessons •{" "}
                        {formatDuration(course.total_duration)}
                      </p>
                    </div>

                    <Accordion type="multiple" className="w-full" defaultValue={[course.modules[0]?.id]}>
                      {course.modules.map(
                        (module: {
                          id: string
                          title: string
                          description: string | null
                          lessons: Array<{
                            id: string
                            title: string
                            content_type: string
                            duration: number
                            is_preview: boolean
                          }>
                        }) => (
                          <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-4 mb-2">
                            <AccordionTrigger className="hover:no-underline">
                              <div className="flex flex-1 items-center justify-between pr-4">
                                <span className="font-semibold">{module.title}</span>
                                <span className="text-sm text-muted-foreground">
                                  {module.lessons?.length || 0} lessons
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2 pt-2">
                                {module.lessons?.map((lesson) => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between rounded-lg p-3 hover:bg-muted/50"
                                  >
                                    <div className="flex items-center gap-3">
                                      {lesson.content_type === "video" ? (
                                        <Play className="h-4 w-4 text-muted-foreground" />
                                      ) : lesson.content_type === "quiz" ? (
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                                      )}
                                      <span className="text-sm">{lesson.title}</span>
                                      {lesson.is_preview && (
                                        <Badge variant="outline" className="text-xs">
                                          Preview
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                      {lesson.duration > 0 ? formatDuration(lesson.duration) : ""}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ),
                      )}
                    </Accordion>
                  </div>
                </TabsContent>

                <TabsContent value="instructor">
                  <div className="rounded-xl border border-border bg-card p-6">
                    <div className="flex items-start gap-6">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                        <img
                          src={course.teacher?.avatar_url || `/placeholder.svg?height=96&width=96&query=avatar`}
                          alt={course.teacher?.full_name || "Instructor"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{course.teacher?.full_name}</h3>
                        <p className="mb-4 text-muted-foreground">Course Instructor</p>
                        <p className="text-muted-foreground">
                          {course.teacher?.bio || "Verified instructor on EduPlatform."}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">Student Reviews</h2>
                      <div className="flex items-center gap-2">
                        <Star className="h-6 w-6 fill-gold-400 text-gold-400" />
                        <span className="text-2xl font-bold">{course.average_rating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({course.review_count} reviews)</span>
                      </div>
                    </div>

                    {course.reviews.length === 0 ? (
                      <div className="rounded-xl border border-border bg-card p-8 text-center">
                        <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {course.reviews.map(
                          (review: {
                            id: string
                            rating: number
                            comment: string | null
                            created_at: string
                            student?: { full_name: string | null; avatar_url: string | null }
                          }) => (
                            <div key={review.id} className="rounded-xl border border-border bg-card p-6">
                              <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
                                    <img
                                      src={
                                        review.student?.avatar_url || `/placeholder.svg?height=40&width=40&query=avatar`
                                      }
                                      alt={review.student?.full_name || "Student"}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-semibold">{review.student?.full_name || "Student"}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(review.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating ? "fill-gold-400 text-gold-400" : "text-muted"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              {review.comment && <p className="text-muted-foreground">{review.comment}</p>}
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar - Related Info */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Quick Stats */}
                <div className="rounded-xl border border-border bg-card p-6">
                  <h3 className="mb-4 font-semibold">Course Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Enrolled</span>
                      <span className="font-medium">{course.enrollment_count} students</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium">{formatDuration(course.total_duration)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Lessons</span>
                      <span className="font-medium">{totalLessons}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Level</span>
                      <span className="font-medium capitalize">{course.level}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Language</span>
                      <span className="font-medium">{course.language}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
