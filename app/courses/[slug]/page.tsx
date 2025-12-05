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

  const { data: modules } = await supabase
    .from("modules")
    .select(`
      *,
      lessons(id, title, content_type, duration, is_preview, position)
    `)
    .eq("course_id", course.id)
    .order("position")

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
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  const totalLessons = course.modules.reduce(
    (acc: number, m: { lessons: unknown[] }) => acc + (m.lessons?.length || 0),
    0,
  )

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />

      <section className="bg-gradient-to-br from-primary/95 via-primary to-primary/90 px-4 py-6 sm:py-8 lg:py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2 order-2 lg:order-1">
              <div className="mb-3 sm:mb-4 flex flex-wrap items-center gap-2">
                {course.category && (
                  <Badge className="bg-white/20 text-white hover:bg-white/30 text-xs">{course.category.name}</Badge>
                )}
                <Badge variant="outline" className="border-white/30 capitalize text-white/90 text-xs">
                  {course.level}
                </Badge>
                {course.is_featured && <Badge className="bg-yellow-500 text-primary text-xs">Featured</Badge>}
              </div>

              <h1 className="mb-3 sm:mb-4 text-xl sm:text-2xl lg:text-4xl font-bold text-white leading-tight">
                {course.title}
              </h1>

              <p className="mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg text-white/80 line-clamp-3 sm:line-clamp-none">
                {course.short_description || course.description}
              </p>

              <div className="mb-4 sm:mb-6 grid grid-cols-2 sm:flex sm:flex-wrap gap-3 sm:gap-6 text-white/90">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-white">{course.average_rating.toFixed(1)}</span>
                  <span className="hidden sm:inline">({course.review_count})</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{course.enrollment_count} students</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{formatDuration(course.total_duration)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{totalLessons} lessons</span>
                </div>
              </div>

              {/* Teacher */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full bg-white/20">
                  <img
                    src={course.teacher?.avatar_url || `/placeholder.svg?height=48&width=48&query=avatar`}
                    alt={course.teacher?.full_name || "Instructor"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-white/70">Created by</p>
                  <p className="text-sm sm:text-base font-semibold text-white">{course.teacher?.full_name}</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 order-1 lg:order-2">
              <div className="overflow-hidden rounded-xl bg-card shadow-2xl">
                {/* Preview Video/Image */}
                <div className="relative aspect-video bg-muted">
                  <img
                    src={
                      course.thumbnail_url ||
                      `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(course.title) || "/placeholder.svg"}`
                    }
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                  {course.preview_video_url && (
                    <button className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40">
                      <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white/90 text-primary">
                        <Play className="ml-1 h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                    </button>
                  )}
                </div>

                <div className="p-4 sm:p-6">
                  <div className="mb-4 sm:mb-6">
                    <span className="text-2xl sm:text-4xl font-bold text-foreground">
                      {course.price === 0 ? "Free" : `₦${course.price.toLocaleString()}`}
                    </span>
                  </div>

                  <CourseEnrollButton course={course} enrollment={enrollment} />

                  <div className="mt-4 sm:mt-6 grid grid-cols-2 sm:grid-cols-1 gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{formatDuration(course.total_duration)}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <span>{totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <span>{course.language}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <span className="capitalize">{course.level}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      <Award className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <span>Certificate</span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                      <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                      <span>Lifetime access</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex-1 px-4 py-6 sm:py-8 lg:py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="w-full">
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-4 sm:mb-8">
                  <TabsList className="w-full sm:w-auto min-w-max justify-start">
                    <TabsTrigger value="overview" className="text-xs sm:text-sm">
                      Overview
                    </TabsTrigger>
                    <TabsTrigger value="curriculum" className="text-xs sm:text-sm">
                      Curriculum
                    </TabsTrigger>
                    <TabsTrigger value="instructor" className="text-xs sm:text-sm">
                      Instructor
                    </TabsTrigger>
                    <TabsTrigger value="reviews" className="text-xs sm:text-sm">
                      Reviews
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-6 sm:space-y-8">
                  <div>
                    <h2 className="mb-3 sm:mb-4 text-lg sm:text-2xl font-bold">About this course</h2>
                    <div className="prose prose-sm sm:prose-base prose-gray max-w-none text-muted-foreground">
                      <p>{course.description}</p>
                    </div>
                  </div>

                  {course.objectives && course.objectives.length > 0 && (
                    <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
                      <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">What you&apos;ll learn</h3>
                      <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
                        {course.objectives.map((objective: string, index: number) => (
                          <div key={index} className="flex gap-2 sm:gap-3">
                            <CheckCircle className="mt-0.5 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-green-500" />
                            <span className="text-xs sm:text-sm">{objective}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {course.requirements && course.requirements.length > 0 && (
                    <div>
                      <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">Requirements</h3>
                      <ul className="space-y-2">
                        {course.requirements.map((req: string, index: number) => (
                          <li key={index} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                            <span className="mt-1.5 sm:mt-2 h-1 w-1 sm:h-1.5 sm:w-1.5 flex-shrink-0 rounded-full bg-primary" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {course.tags && course.tags.length > 0 && (
                    <div>
                      <h3 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {course.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="curriculum">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h2 className="text-lg sm:text-2xl font-bold">Course Curriculum</h2>
                      <p className="text-xs sm:text-sm text-muted-foreground">
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
                          <AccordionItem
                            key={module.id}
                            value={module.id}
                            className="border rounded-lg px-3 sm:px-4 mb-2"
                          >
                            <AccordionTrigger className="hover:no-underline py-3 sm:py-4">
                              <div className="flex flex-1 items-center justify-between pr-2 sm:pr-4 text-left">
                                <span className="font-semibold text-sm sm:text-base">{module.title}</span>
                                <span className="text-xs sm:text-sm text-muted-foreground ml-2">
                                  {module.lessons?.length || 0} lessons
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-1 sm:space-y-2 pt-2">
                                {module.lessons?.map((lesson) => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between rounded-lg p-2 sm:p-3 hover:bg-muted/50"
                                  >
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                      {lesson.content_type === "video" ? (
                                        <Play className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                                      ) : lesson.content_type === "quiz" ? (
                                        <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                                      ) : (
                                        <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                                      )}
                                      <span className="text-xs sm:text-sm truncate">{lesson.title}</span>
                                      {lesson.is_preview && (
                                        <Badge variant="outline" className="text-[10px] sm:text-xs flex-shrink-0">
                                          Preview
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="text-[10px] sm:text-xs text-muted-foreground flex-shrink-0 ml-2">
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
                  <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
                      <div className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                        <img
                          src={course.teacher?.avatar_url || `/placeholder.svg?height=96&width=96&query=avatar`}
                          alt={course.teacher?.full_name || "Instructor"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold">{course.teacher?.full_name}</h3>
                        <p className="mb-3 sm:mb-4 text-sm text-muted-foreground">Course Instructor</p>
                        <p className="text-sm text-muted-foreground">
                          {course.teacher?.bio || "Verified instructor on EduPlatform."}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <h2 className="text-lg sm:text-2xl font-bold">Student Reviews</h2>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 sm:h-6 sm:w-6 fill-yellow-400 text-yellow-400" />
                        <span className="text-xl sm:text-2xl font-bold">{course.average_rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">({course.review_count})</span>
                      </div>
                    </div>

                    {course.reviews.length === 0 ? (
                      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 text-center">
                        <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>
                      </div>
                    ) : (
                      <div className="space-y-3 sm:space-y-4">
                        {course.reviews.map(
                          (review: {
                            id: string
                            rating: number
                            comment: string | null
                            created_at: string
                            student?: { full_name: string | null; avatar_url: string | null }
                          }) => (
                            <div key={review.id} className="rounded-xl border border-border bg-card p-4 sm:p-6">
                              <div className="mb-3 sm:mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="h-8 w-8 sm:h-10 sm:w-10 overflow-hidden rounded-full bg-muted">
                                    <img
                                      src={
                                        review.student?.avatar_url || `/placeholder.svg?height=40&width=40&query=avatar`
                                      }
                                      alt={review.student?.full_name || "Student"}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <p className="text-sm sm:text-base font-semibold">
                                      {review.student?.full_name || "Student"}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                                      {new Date(review.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                        i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              {review.comment && (
                                <p className="text-xs sm:text-sm text-muted-foreground">{review.comment}</p>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
