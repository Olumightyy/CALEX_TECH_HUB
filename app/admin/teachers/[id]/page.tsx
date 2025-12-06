import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, BookOpen, Users, Mail, Calendar, FileText, ExternalLink } from "lucide-react"
import { TeacherVerificationActions } from "@/components/admin/teacher-verification-actions"
import { getTeacherDetails } from "@/lib/actions/teacher"

export default async function AdminTeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getTeacherDetails(id)

  if (!result.success || !result.data?.teacher) {
    notFound()
  }

  const { teacher, courses, application } = result.data
  const totalStudents = courses.reduce((acc: number, c: any) => acc + (c.enrollment_count || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/teachers">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{teacher.full_name || "Unknown Teacher"}</h1>
              {teacher.is_verified ? (
                <Badge className="bg-emerald-100 text-emerald-700">Verified</Badge>
              ) : (
                <Badge className="bg-amber-100 text-amber-700">Pending Verification</Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">Teacher Profile</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                {teacher.avatar_url ? (
                  <img
                    src={teacher.avatar_url || "/placeholder.svg"}
                    alt={teacher.full_name || ""}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{teacher.full_name?.charAt(0) || "T"}</span>
                  </div>
                )}
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold">{teacher.full_name}</h3>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {teacher.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined {new Date(teacher.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {teacher.bio && (
                    <div>
                      <h4 className="font-medium mb-1">Bio</h4>
                      <p className="text-muted-foreground">{teacher.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Details */}
          {application && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
                <CardDescription>Submitted information for verification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Expertise</h4>
                    <p className="mt-1">{application.expertise || "Not specified"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Experience</h4>
                    <p className="mt-1">
                      {application.experience_years ? `${application.experience_years} years` : "Not specified"}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Qualifications</h4>
                  <p className="mt-1">{application.qualifications || "Not specified"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Reason for Applying</h4>
                  <p className="mt-1">{application.reason || "Not specified"}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  {application.portfolio_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={application.portfolio_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Portfolio
                      </a>
                    </Button>
                  )}
                  {application.linkedin_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={application.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {application.documents_url && application.documents_url.length > 0 && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={application.documents_url[0]} target="_blank" rel="noopener noreferrer">
                        <FileText className="mr-2 h-4 w-4" />
                        Documents
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Courses */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Courses</CardTitle>
              <CardDescription>{courses.length} courses created</CardDescription>
            </CardHeader>
            <CardContent>
              {courses.length > 0 ? (
                <div className="space-y-3">
                  {courses.map((course: any) => (
                    <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <h4 className="font-medium">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">{course.enrollment_count || 0} students</p>
                      </div>
                      <Badge variant={course.status === "published" ? "default" : "secondary"}>{course.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No courses created yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Stats */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>Total Courses</span>
                </div>
                <span className="font-bold">{courses.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600" />
                  <span>Total Students</span>
                </div>
                <span className="font-bold">{totalStudents}</span>
              </div>
            </CardContent>
          </Card>

          {/* Verification Actions */}
          {!teacher.is_verified && <TeacherVerificationActions teacherId={teacher.id} />}
        </div>
      </div>
    </div>
  )
}
