import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, BookOpen, Users, Clock, Eye } from "lucide-react"
import { CourseApprovalActions } from "@/components/admin/course-approval-actions"

export default async function AdminCourseReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: course } = await supabase
    .from("courses")
    .select(`
      *,
      profiles(id, full_name, email, bio, avatar_url),
      categories(name),
      modules(
        *,
        lessons(*)
      ),
      enrollments(count)
    `)
    .eq("id", id)
    .single()

  if (!course) notFound()

  const totalLessons = course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0

  const totalDuration =
    course.modules?.reduce(
      (acc: number, m: any) => acc + (m.lessons?.reduce((a: number, l: any) => a + (l.duration_minutes || 0), 0) || 0),
      0,
    ) || 0

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-emerald-100 text-emerald-700">Published</Badge>
      case "pending_review":
        return <Badge className="bg-amber-100 text-amber-700">Pending Review</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/courses">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
              {getStatusBadge(course.status)}
            </div>
            <p className="text-muted-foreground mt-1">
              Submitted by {course.profiles?.full_name} on {new Date(course.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/courses/${course.slug}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modules</p>
                <p className="text-xl font-bold">{course.modules?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <Clock className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-xl font-bold">{totalDuration} min</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lessons</p>
                <p className="text-xl font-bold">{totalLessons}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50">
                <span className="text-xl font-bold text-blue-600 px-1">₦</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-xl font-bold">{course.price === 0 ? "Free" : `₦${course.price.toLocaleString()}`}</p>
              </div>
            </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Course Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {course.description || "No description provided"}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="curriculum" className="mt-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Course Curriculum</CardTitle>
                  <CardDescription>
                    {course.modules?.length || 0} modules · {totalLessons} lessons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {course.modules && course.modules.length > 0 ? (
                    <div className="space-y-4">
                      {course.modules
                        .sort((a: any, b: any) => a.position - b.position)
                        .map((module: any, index: number) => (
                          <div key={module.id} className="border rounded-lg p-4">
                            <h4 className="font-semibold">
                              Module {index + 1}: {module.title}
                            </h4>
                            {module.description && (
                              <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                            )}
                            <div className="mt-3 space-y-2">
                              {module.lessons
                                ?.sort((a: any, b: any) => a.position - b.position)
                                .map((lesson: any, lessonIndex: number) => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between p-2 rounded bg-muted/50"
                                  >
                                    <span className="text-sm">
                                      {lessonIndex + 1}. {lesson.title}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {lesson.duration_minutes} min · {lesson.content_type}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No curriculum added yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* Instructor Info */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {course.profiles?.avatar_url ? (
                  <img
                    src={course.profiles.avatar_url || "/placeholder.svg"}
                    alt={course.profiles.full_name || ""}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">
                      {course.profiles?.full_name?.charAt(0) || "T"}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold">{course.profiles?.full_name}</h4>
                  <p className="text-sm text-muted-foreground">{course.profiles?.email}</p>
                </div>
              </div>
              {course.profiles?.bio && <p className="mt-4 text-sm text-muted-foreground">{course.profiles.bio}</p>}
              <Button variant="outline" className="w-full mt-4 bg-transparent" asChild>
                <Link href={`/admin/teachers/${course.profiles?.id}`}>View Profile</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Approval Actions */}
          {course.status === "pending_review" && <CourseApprovalActions courseId={course.id} />}
        </div>
      </div>
    </div>
  )
}
