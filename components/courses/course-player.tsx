"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { createClient } from "@/lib/supabase/client"
import { Play, CheckCircle, FileText, BookOpen, ArrowLeft, Award, ChevronLeft, ChevronRight } from "lucide-react"
import type { Course, Module, Lesson, Enrollment, LessonProgress } from "@/lib/types/database"

interface CourseWithModules extends Course {
  modules: (Module & { lessons: Lesson[] })[]
  teacher?: { id: string; full_name: string | null; avatar_url: string | null }
}

interface CoursePlayerProps {
  course: CourseWithModules
  enrollment: Enrollment
  progress: LessonProgress[]
  userId: string
}

export function CoursePlayer({ course, enrollment, progress, userId }: CoursePlayerProps) {
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(
    new Set(progress.filter((p) => p.is_completed).map((p) => p.lesson_id)),
  )
  const router = useRouter()

  // Get all lessons in order
  const allLessons = course.modules.flatMap((m) => m.lessons)

  // Find current lesson (first uncompleted or first lesson)
  useEffect(() => {
    if (!currentLesson && allLessons.length > 0) {
      const firstUncompleted = allLessons.find((l) => !completedLessons.has(l.id))
      setCurrentLesson(firstUncompleted || allLessons[0])
    }
  }, [allLessons, completedLessons, currentLesson])

  const currentIndex = currentLesson ? allLessons.findIndex((l) => l.id === currentLesson.id) : 0
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  const progressPercentage = allLessons.length > 0 ? Math.round((completedLessons.size / allLessons.length) * 100) : 0

  const markAsComplete = async () => {
    if (!currentLesson) return

    const supabase = createClient()

    // Update or insert lesson progress
    const { error } = await supabase.from("lesson_progress").upsert({
      student_id: userId,
      lesson_id: currentLesson.id,
      course_id: course.id,
      is_completed: true,
      completed_at: new Date().toISOString(),
    })

    if (!error) {
      setCompletedLessons((prev) => new Set([...prev, currentLesson.id]))

      // Update enrollment progress
      const newProgress = Math.round(((completedLessons.size + 1) / allLessons.length) * 100)
      await supabase
        .from("enrollments")
        .update({
          progress: newProgress,
          last_accessed_at: new Date().toISOString(),
          completed_at: newProgress === 100 ? new Date().toISOString() : null,
          status: newProgress === 100 ? "completed" : "active",
        })
        .eq("id", enrollment.id)

      // If completed the course, generate certificate
      if (newProgress === 100) {
        await generateCertificate()
      }

      // Move to next lesson if available
      if (nextLesson) {
        setCurrentLesson(nextLesson)
      }
    }
  }

  const generateCertificate = async () => {
    const supabase = createClient()

    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", userId).single()

    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    await supabase.from("certificates").insert({
      student_id: userId,
      course_id: course.id,
      certificate_number: certificateNumber,
      student_name: profile?.full_name || "Student",
      course_title: course.title,
      teacher_name: course.teacher?.full_name || "Instructor",
    })
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/student/my-courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Link>
          </Button>
          <div className="hidden md:block">
            <h1 className="text-sm font-medium">{course.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Progress:</span>
            <Progress value={progressPercentage} className="w-24" />
            <span className="font-medium">{progressPercentage}%</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          {/* Video Player */}
          <div className="relative aspect-video w-full bg-black">
            {currentLesson?.video_url ? (
              <video key={currentLesson.id} src={currentLesson.video_url} controls className="h-full w-full" autoPlay />
            ) : currentLesson?.content_type === "text" ? (
              <div className="flex h-full w-full items-center justify-center bg-muted p-8">
                <div className="max-w-3xl prose prose-sm">
                  <h2>{currentLesson.title}</h2>
                  <div dangerouslySetInnerHTML={{ __html: currentLesson.content || "" }} />
                </div>
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <div className="text-center">
                  <Play className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                  <p className="text-muted-foreground">Select a lesson to begin</p>
                </div>
              </div>
            )}
          </div>

          {/* Lesson Navigation */}
          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              disabled={!prevLesson}
              onClick={() => prevLesson && setCurrentLesson(prevLesson)}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <div className="text-center">
              <p className="font-medium">{currentLesson?.title}</p>
              <p className="text-xs text-muted-foreground">
                Lesson {currentIndex + 1} of {allLessons.length}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {currentLesson && !completedLessons.has(currentLesson.id) && (
                <Button size="sm" onClick={markAsComplete}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark Complete
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={!nextLesson}
                onClick={() => nextLesson && setCurrentLesson(nextLesson)}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Lesson Details Tabs */}
          <div className="flex-1 overflow-auto p-4">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <h3 className="mb-2 text-lg font-semibold">{currentLesson?.title}</h3>
                <p className="text-muted-foreground">
                  {currentLesson?.description || "No description available for this lesson."}
                </p>
              </TabsContent>
              <TabsContent value="resources" className="mt-4">
                {currentLesson?.pdf_url ? (
                  <a
                    href={currentLesson.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    Download PDF Resource
                  </a>
                ) : (
                  <p className="text-muted-foreground">No resources for this lesson.</p>
                )}
              </TabsContent>
              <TabsContent value="notes" className="mt-4">
                <p className="text-muted-foreground">Notes feature coming soon.</p>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sidebar - Course Content */}
        <div className="hidden w-80 flex-shrink-0 overflow-auto border-l border-border bg-card lg:block">
          <div className="p-4">
            <h2 className="mb-4 font-semibold">Course Content</h2>
            <Accordion type="multiple" className="w-full" defaultValue={course.modules.map((m) => m.id)}>
              {course.modules.map((module) => (
                <AccordionItem key={module.id} value={module.id}>
                  <AccordionTrigger className="text-sm hover:no-underline">
                    <div className="flex flex-1 items-center justify-between pr-2">
                      <span className="text-left">{module.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {module.lessons.filter((l) => completedLessons.has(l.id)).length}/{module.lessons.length}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-1 pl-2">
                      {module.lessons.map((lesson) => {
                        const isCompleted = completedLessons.has(lesson.id)
                        const isCurrent = currentLesson?.id === lesson.id

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setCurrentLesson(lesson)}
                            className={`flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm transition-colors ${
                              isCurrent ? "bg-primary/10 text-primary" : "hover:bg-muted"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
                            ) : lesson.content_type === "video" ? (
                              <Play className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            ) : lesson.content_type === "quiz" ? (
                              <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            ) : (
                              <BookOpen className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                            )}
                            <span className="flex-1 truncate">{lesson.title}</span>
                            {lesson.duration > 0 && (
                              <span className="text-xs text-muted-foreground">{formatDuration(lesson.duration)}</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Certificate Card (shown when completed) */}
          {progressPercentage === 100 && (
            <div className="border-t border-border p-4">
              <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-900/20">
                <Award className="mx-auto mb-2 h-8 w-8 text-green-600" />
                <h3 className="mb-1 font-semibold text-green-800 dark:text-green-400">Course Completed!</h3>
                <p className="mb-3 text-sm text-green-700 dark:text-green-500">
                  Congratulations on finishing this course.
                </p>
                <Button size="sm" asChild>
                  <Link href="/student/certificates">View Certificate</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
