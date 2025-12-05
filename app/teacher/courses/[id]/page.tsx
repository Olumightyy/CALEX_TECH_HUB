import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, Eye } from "lucide-react"
import { CourseForm } from "@/components/teacher/course-form"
import { ModuleManager } from "@/components/teacher/module-manager"
import { CourseAnalytics } from "@/components/teacher/course-analytics"

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: course } = await supabase
    .from("courses")
    .select(`
      *,
      categories(id, name, slug),
      modules(
        *,
        lessons(*)
      )
    `)
    .eq("id", id)
    .eq("teacher_id", user.id)
    .single()

  if (!course) notFound()

  const { data: categories } = await supabase.from("categories").select("*").order("name")

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
            <Link href="/teacher/courses">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
              {getStatusBadge(course.status)}
            </div>
            <p className="text-muted-foreground mt-1">Edit course details, modules, and lessons</p>
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

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Course Details</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
              <CardDescription>Update your course information</CardDescription>
            </CardHeader>
            <CardContent>
              <CourseForm
                categories={categories || []}
                initialData={{
                  id: course.id,
                  title: course.title,
                  slug: course.slug,
                  description: course.description || "",
                  short_description: course.short_description || "",
                  category_id: course.category_id || "",
                  level: course.level,
                  price: course.price,
                  is_featured: course.is_featured,
                  thumbnail_url: course.thumbnail_url,
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum">
          <ModuleManager courseId={course.id} initialModules={course.modules || []} />
        </TabsContent>

        <TabsContent value="analytics">
          <CourseAnalytics courseId={course.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
