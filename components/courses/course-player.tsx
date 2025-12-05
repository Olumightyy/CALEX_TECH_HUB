"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { createClient } from "@/lib/supabase/client"
import { Play, CheckCircle, FileText, BookOpen, ArrowLeft, Award, ChevronLeft, ChevronRight, Shield } from "lucide-react"
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
  const [isUpdating, setIsUpdating] = useState(false)
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
    if (!currentLesson || isUpdating) return
    setIsUpdating(true)

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
      const newCompleted = new Set([...completedLessons, currentLesson.id])
      setCompletedLessons(newCompleted)

      // Update enrollment progress
      const newProgress = Math.round(((newCompleted.size) / allLessons.length) * 100)
      
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
      if (newProgress === 100 && enrollment.progress < 100) {
         // Only generate if not already 100% to avoid duplicates
        await generateCertificate()
      }

      // Move to next lesson if available
      if (nextLesson) {
        setCurrentLesson(nextLesson)
      }
    }
    setIsUpdating(false)
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
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-slate-50">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild className="text-slate-600 hover:text-amber-600 hover:bg-amber-50">
            <Link href="/student/my-courses">
              <ArrowLeft className="mr-2 h-4 w-4" />
              My Courses
            </Link>
          </Button>
          <div className="hidden md:block h-6 w-px bg-slate-200 mx-2"></div>
          <div className="hidden md:flex flex-col">
            <h1 className="text-sm font-bold text-slate-900 line-clamp-1">{course.title}</h1>
            <p className="text-xs text-slate-500">
                {course.teacher?.full_name || "Instructor"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 font-medium hidden sm:inline">Your Progress</span>
            <div className="flex flex-col gap-1 w-32">
                <Progress value={progressPercentage} className="h-2 bg-slate-100" indicatorClassName="bg-amber-500" />
            </div>
            <span className="font-bold text-slate-900">{progressPercentage}%</span>
          </div>
          {progressPercentage === 100 && (
             <Award className="h-6 w-6 text-amber-500 animate-pulse" />
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Video Player */}
          <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center shadow-inner">
            {currentLesson?.video_url ? (
              <video 
                key={currentLesson.id} 
                src={currentLesson.video_url} 
                controls 
                className="h-full w-full max-h-[70vh]" 
                controlsList="nodownload"
                // autoPlay // Removed autoplay to be less intrusive
              />
            ) : currentLesson?.content_type === "text" ? (
              <div className="flex h-full w-full items-center justify-center bg-slate-50 p-8 overflow-y-auto">
                <div className="max-w-3xl prose prose-slate">
                  <h2>{currentLesson.title}</h2>
                  <div dangerouslySetInnerHTML={{ __html: currentLesson.content || "" }} />
                </div>
              </div>
            ) : currentLesson?.content_type === "quiz" ? (
               <div className="flex flex-col items-center justify-center text-center p-12 h-full w-full bg-slate-50">
                <div className="bg-amber-100 p-6 rounded-full mb-6">
                   <FileText className="h-12 w-12 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Quiz: {currentLesson.title}</h3>
                <p className="text-slate-500 mb-6">This lesson contains a quiz assessment.</p>
                <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold">
                    Start Quiz
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-12">
                <div className="bg-slate-900/50 p-6 rounded-full mb-6 backdrop-blur-sm border border-slate-700">
                   <Play className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Ready to Start?</h3>
                <p className="text-slate-400">Select a lesson from the menu on the right to begin learning.</p>
              </div>
            )}
          </div>

          {/* Lesson Navigation & Actions */}
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
            <Button
              variant="outline"
              size="sm"
              disabled={!prevLesson}
              onClick={() => prevLesson && setCurrentLesson(prevLesson)}
              className="border-slate-200 hover:bg-slate-50 hover:text-slate-900"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            <div className="text-center hidden sm:block">
              <p className="font-bold text-slate-900">{currentLesson?.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Lesson {currentIndex + 1} of {allLessons.length}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {currentLesson && !completedLessons.has(currentLesson.id) && (
                <Button size="sm" onClick={markAsComplete} disabled={isUpdating} className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold shadow-sm">
                  {isUpdating ? "Saving..." : (
                    <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark Complete
                    </>
                  )}
                </Button>
              )}
               {currentLesson && completedLessons.has(currentLesson.id) && (
                 <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-sm font-medium border border-green-100">
                    <CheckCircle className="h-4 w-4" />
                    Completed
                 </div>
              )}

              <Button
                variant="outline"
                size="sm"
                disabled={!nextLesson}
                onClick={() => nextLesson && setCurrentLesson(nextLesson)}
                className="border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Lesson Details Tabs */}
          <div className="flex-1 p-6 bg-slate-50">
            <Tabs defaultValue="overview" className="max-w-4xl mx-auto">
              <TabsList className="bg-white border border-slate-200 p-1 rounded-lg">
                <TabsTrigger value="overview" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900">Overview</TabsTrigger>
                <TabsTrigger value="resources" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900">Resources</TabsTrigger>
                <TabsTrigger value="notes" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900">Notes</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="mb-4 text-xl font-bold text-slate-900">{currentLesson?.title}</h3>
                <div className="prose prose-slate max-w-none text-slate-600">
                  <p>{currentLesson?.description || "No description available for this lesson."}</p>
                </div>
              </TabsContent>
              <TabsContent value="resources" className="mt-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                {currentLesson?.pdf_url ? (
                  <a
                    href={currentLesson.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 rounded-lg border border-slate-200 hover:border-amber-500 hover:bg-amber-50 transition-colors group"
                  >
                    <div className="h-10 w-10 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center group-hover:bg-amber-200 group-hover:text-amber-800 transition-colors">
                         <FileText className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                        <p className="font-medium text-slate-900 group-hover:text-amber-800">Download PDF Resource</p>
                        <p className="text-xs text-slate-500">Supplementary material for this lesson</p>
                    </div>
                  </a>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                     <FileText className="h-8 w-8 mx-auto mb-2 opacity-20" />
                     <p>No resources attached to this lesson.</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="notes" className="mt-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <div className="text-center py-8 text-slate-500">
                     <div className="inline-flex items-center justify-center p-3 bg-amber-50 rounded-full mb-3">
                         <BookOpen className="h-6 w-6 text-amber-500" />
                     </div>
                     <h3 className="text-lg font-medium text-slate-900 mb-1">My Notes</h3>
                     <p className="mb-4">Taking notes helps memory retention. Feature coming soon!</p>
                  </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sidebar - Course Content */}
        <div className="hidden w-96 flex-shrink-0 flex-col border-l border-slate-200 bg-white lg:flex h-full">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-slate-900">Course Content</h2>
                <Badge variant="outline" className="bg-white text-xs font-normal text-slate-500">
                    {course.modules.length} Modules
                </Badge>
            </div>
            {/* Certificate Teaser */}
            {progressPercentage < 100 && (
                <div className="flex items-center gap-2 text-xs text-slate-500 bg-white p-2 rounded-md border border-slate-100 shadow-sm">
                    <Award className="h-4 w-4 text-amber-500" />
                    <span>Complete {allLessons.length - completedLessons.size} more lessons to earn certificate</span>
                </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <Accordion type="multiple" className="w-full space-y-4" defaultValue={course.modules.map((m) => m.id)}>
              {course.modules.map((module) => (
                <AccordionItem key={module.id} value={module.id} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/30">
                  <AccordionTrigger className="px-4 py-3 text-sm font-semibold text-slate-800 data-[state=open]:bg-slate-100/50 hover:bg-slate-100/50 hover:no-underline transition-colors">
                    <div className="flex flex-1 items-center justify-between pr-2">
                      <span className="text-left line-clamp-1">{module.title}</span>
                      <span className="text-xs text-slate-400 font-normal ml-2 whitespace-nowrap">
                        {module.lessons.filter((l) => completedLessons.has(l.id)).length}/{module.lessons.length}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-0 pb-0">
                    <div className="divide-y divide-slate-100">
                      {module.lessons.map((lesson) => {
                        const isCompleted = completedLessons.has(lesson.id)
                        const isCurrent = currentLesson?.id === lesson.id

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setCurrentLesson(lesson)}
                            className={`flex w-full items-start gap-3 p-3.5 text-left text-sm transition-all border-l-4 ${
                              isCurrent 
                                ? "border-l-amber-500 bg-amber-50 text-slate-900" 
                                : "border-l-transparent hover:bg-slate-50 text-slate-600"
                            }`}
                          >
                            <div className={`mt-0.5 ${isCompleted ? "text-green-500" : isCurrent ? "text-amber-500" : "text-slate-400"}`}>
                                {isCompleted ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : lesson.content_type === "video" ? (
                                  <Play className="h-4 w-4" />
                                ) : (
                                  <FileText className="h-4 w-4" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`truncate font-medium ${isCurrent ? "text-amber-900" : "text-slate-700"}`}>{lesson.title}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{formatDuration(lesson.duration)}</p>
                            </div>
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
            <div className="border-t border-slate-200 p-6 bg-slate-50">
              <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center shadow-sm">
                <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Award className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mb-1 font-bold text-green-800">Course Completed!</h3>
                <p className="mb-4 text-xs text-green-600 px-2">
                  You&apos;ve mastered this course. Download your certificate now.
                </p>
                <Button size="sm" asChild className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md">
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

function Badge({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: "default"|"secondary"|"outline" }) {
    // Mini local badge component or import if preferred. Using a simple span here to avoid import issues if default badge is complex, 
    // but typically we should import { Badge } from "@/components/ui/badge". 
    // I will use a simple inline style for the "Modules" badge in sidebar to avoid circular deps or complexity if badge is not imported.
    // Wait, I can import Badge. I imported it in CourseCard.
    // Let me check imports. I did NOT import Badge in the implementation above.
    // Only in CourseCard. I should render it as a standard HTML element or add import.
    // I'll add the Badge import.
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>{children}</span> 
}
