"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { BookOpen, Users, MoreVertical, Edit, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteCourseDialog } from "@/components/teacher/delete-course-dialog"

interface Course {
  id: string
  title: string
  slug: string
  status: string
  price: number
  thumbnail_url: string | null
  enrollments: { count: number }[] | null
  modules: { count: number }[] | null
  categories: { name: string } | null
}

interface CourseListProps {
  courses: Course[]
}

export function CourseList({ courses }: CourseListProps) {
  const allCourses = courses || []
  const publishedCourses = allCourses.filter((c) => c.status === "published")
  const draftCourses = allCourses.filter((c) => c.status === "draft")
  const pendingCourses = allCourses.filter((c) => c.status === "pending_review")
  const rejectedCourses = allCourses.filter((c) => c.status === "rejected")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-emerald-100 text-emerald-700">Published</Badge>
      case "pending_review":
        return <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const CourseListItems = ({ courseList }: { courseList: typeof allCourses }) => (
    <div className="space-y-4">
      {courseList.length > 0 ? (
        courseList.map((course) => {
          const enrollmentCount = course.enrollments?.[0]?.count || 0

          return (
            <div
              key={course.id}
              className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url || "/placeholder.svg"}
                    alt={course.title}
                    className="w-24 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-foreground">{course.title}</h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>{course.categories?.name || "Uncategorized"}</span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {enrollmentCount} students
                    </span>
                    <span>{course.price === 0 ? "Free" : `$${course.price}`}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {getStatusBadge(course.status)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/teacher/courses/${course.id}`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Course
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/courses/${course.slug}`} target="_blank">
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DeleteCourseDialog
                      courseId={course.id}
                      courseTitle={course.title}
                      hasEnrollments={enrollmentCount > 0}
                      trigger={
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <span className="flex items-center">
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete Course
                          </span>
                        </DropdownMenuItem>
                      }
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )
        })
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No courses found</h3>
          <p className="mt-2 text-muted-foreground">Create your first course to get started</p>
        </div>
      )}
    </div>
  )

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All ({allCourses.length})</TabsTrigger>
              <TabsTrigger value="published">Published ({publishedCourses.length})</TabsTrigger>
              <TabsTrigger value="drafts">Drafts ({draftCourses.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingCourses.length})</TabsTrigger>
              {rejectedCourses.length > 0 && (
                <TabsTrigger value="rejected">Rejected ({rejectedCourses.length})</TabsTrigger>
              )}
            </TabsList>
          </div>

          <TabsContent value="all">
            <CourseListItems courseList={allCourses} />
          </TabsContent>
          <TabsContent value="published">
            <CourseListItems courseList={publishedCourses} />
          </TabsContent>
          <TabsContent value="drafts">
            <CourseListItems courseList={draftCourses} />
          </TabsContent>
          <TabsContent value="pending">
            <CourseListItems courseList={pendingCourses} />
          </TabsContent>
          <TabsContent value="rejected">
            <CourseListItems courseList={rejectedCourses} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
