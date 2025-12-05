"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import { PlusCircle, GripVertical, Trash2, Edit, Video, FileText, File, Loader2, Upload, BookOpen, Clock, PlayCircle, FileAudio, FileIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Lesson {
  id: string
  title: string
  content_type: string
  content_url: string | null
  content_text: string | null
  duration_minutes: number
  position: number
  is_preview: boolean
}

interface Module {
  id: string
  title: string
  description: string | null
  position: number
  lessons: Lesson[]
}

interface ModuleManagerProps {
  courseId: string
  initialModules: Module[]
}

export function ModuleManager({ courseId, initialModules }: ModuleManagerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [modules, setModules] = useState<Module[]>(initialModules)
  const [isLoading, setIsLoading] = useState(false)
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false)
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string; lesson: Lesson | null }>({
    moduleId: "",
    lesson: null,
  })

  const [moduleForm, setModuleForm] = useState({ title: "", description: "" })
  const [lessonForm, setLessonForm] = useState({
    title: "",
    content_type: "video",
    content_url: "",
    content_text: "",
    duration_minutes: 0,
    is_preview: false,
  })
  const [uploadingFile, setUploadingFile] = useState(false)

  const handleAddModule = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const position = modules.length + 1
      const { data, error } = await supabase
        .from("modules")
        .insert({
          course_id: courseId,
          title: moduleForm.title,
          description: moduleForm.description || null,
          position,
        })
        .select()
        .single()

      if (error) throw error

      setModules([...modules, { ...data, lessons: [] }])
      setModuleForm({ title: "", description: "" })
      setModuleDialogOpen(false)
      toast({ title: "Module added successfully" })
      router.refresh()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateModule = async () => {
    if (!editingModule) return
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("modules")
        .update({
          title: moduleForm.title,
          description: moduleForm.description || null,
        })
        .eq("id", editingModule.id)

      if (error) throw error

      setModules(
        modules.map((m) =>
          m.id === editingModule.id ? { ...m, title: moduleForm.title, description: moduleForm.description } : m,
        ),
      )
      setEditingModule(null)
      setModuleForm({ title: "", description: "" })
      setModuleDialogOpen(false)
      toast({ title: "Module updated successfully" })
      router.refresh()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure? This will delete all lessons in this module.")) return

    const supabase = createClient()
    try {
      const { error } = await supabase.from("modules").delete().eq("id", moduleId)
      if (error) throw error

      setModules(modules.filter((m) => m.id !== moduleId))
      toast({ title: "Module deleted" })
      router.refresh()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${courseId}/${Date.now()}.${fileExt}`
      const bucket = lessonForm.content_type === "video" ? "course-videos" : "lesson-resources"

      const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(fileName)

      setLessonForm({ ...lessonForm, content_url: publicUrl })
      toast({ title: "File uploaded successfully" })
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" })
    } finally {
      setUploadingFile(false)
    }
  }

  const handleAddLesson = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const module = modules.find((m) => m.id === editingLesson.moduleId)
      const position = (module?.lessons.length || 0) + 1

      const { data, error } = await supabase
        .from("lessons")
        .insert({
          module_id: editingLesson.moduleId,
          title: lessonForm.title,
          content_type: lessonForm.content_type,
          content_url: lessonForm.content_url || null,
          content_text: lessonForm.content_text || null,
          duration_minutes: lessonForm.duration_minutes,
          is_preview: lessonForm.is_preview,
          position,
        })
        .select()
        .single()

      if (error) throw error

      setModules(modules.map((m) => (m.id === editingLesson.moduleId ? { ...m, lessons: [...m.lessons, data] } : m)))
      resetLessonForm()
      setLessonDialogOpen(false)
      toast({ title: "Lesson added successfully" })
      router.refresh()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return

    const supabase = createClient()
    try {
      const { error } = await supabase.from("lessons").delete().eq("id", lessonId)
      if (error) throw error

      setModules(
        modules.map((m) => (m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m)),
      )
      toast({ title: "Lesson deleted" })
      router.refresh()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    }
  }

  const resetLessonForm = () => {
    setLessonForm({
      title: "",
      content_type: "video",
      content_url: "",
      content_text: "",
      duration_minutes: 0,
      is_preview: false,
    })
    setEditingLesson({ moduleId: "", lesson: null })
  }

  const openAddLessonDialog = (moduleId: string) => {
    setEditingLesson({ moduleId, lesson: null })
    resetLessonForm()
    setLessonDialogOpen(true)
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <PlayCircle className="h-4 w-4 text-blue-500" />
      case "text":
        return <FileText className="h-4 w-4 text-amber-500" />
      case "audio":
        return <FileAudio className="h-4 w-4 text-purple-500" />
      case "pdf":
        return <FileIcon className="h-4 w-4 text-red-500" />
      default:
        return <File className="h-4 w-4 text-slate-500" />
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-amber-400 to-indigo-600"></div>
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-500" />
                Course Curriculum
            </CardTitle>
            <CardDescription className="text-slate-500">
                Structure your course into modules and lessons.
            </CardDescription>
          </div>
          <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all"
                onClick={() => {
                  setEditingModule(null)
                  setModuleForm({ title: "", description: "" })
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Module
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">{editingModule ? "Edit Module" : "Add New Module"}</DialogTitle>
                <DialogDescription>
                  {editingModule ? "Update module details" : "Create a new module to organize your lessons."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="module-title">Module Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="module-title"
                    placeholder="e.g., Introduction to the Course"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                    className="font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="module-description">Description (Optional)</Label>
                  <Textarea
                    id="module-description"
                    placeholder="Briefly describe what students will learn in this module..."
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setModuleDialogOpen(false)} className="border-slate-200">
                  Cancel
                </Button>
                <Button
                  onClick={editingModule ? handleUpdateModule : handleAddModule}
                  disabled={isLoading || !moduleForm.title}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingModule ? "Save Changes" : "Create Module"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="pt-6 bg-slate-50/50 min-h-[400px]">
          {modules.length > 0 ? (
            <Accordion type="multiple" className="space-y-4">
              {modules
                .sort((a, b) => a.position - b.position)
                .map((module, index) => (
                  <AccordionItem 
                    key={module.id} 
                    value={module.id} 
                    className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden data-[state=open]:ring-1 data-[state=open]:ring-amber-500/20"
                  >
                    <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4 text-left">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-slate-100 text-slate-500 font-bold text-xs ring-1 ring-slate-200/50">
                            {index + 1}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-slate-900 text-lg">{module.title}</span>
                            <span className="text-sm text-slate-500 font-normal flex items-center gap-2">
                                <span>{module.lessons.length} lessons</span>
                                {module.description && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span className="truncate max-w-[300px]">{module.description}</span>
                                    </>
                                )}
                            </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/30">
                      <div className="space-y-4">
                        <div className="flex items-center justify-end gap-2 mb-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingModule(module)
                              setModuleForm({
                                title: module.title,
                                description: module.description || "",
                              })
                              setModuleDialogOpen(true)
                            }}
                            className="text-slate-500 hover:text-amber-600 hover:bg-amber-50"
                          >
                            <Edit className="mr-2 h-3.5 w-3.5" />
                            Edit Details
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteModule(module.id)}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Delete Module
                          </Button>
                        </div>

                        {/* Lessons List */}
                        <div className="space-y-2">
                          {module.lessons
                            .sort((a, b) => a.position - b.position)
                            .map((lesson, lessonIndex) => (
                              <div
                                key={lesson.id}
                                className="group flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:border-amber-200 hover:shadow-sm transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500">
                                     <GripVertical className="h-4 w-4" />
                                  </div>
                                  <div className="p-2 rounded-md bg-slate-50 group-hover:bg-white transition-colors">
                                    {getContentIcon(lesson.content_type)}
                                  </div>
                                  <div className="flex flex-col">
                                      <span className="font-medium text-slate-900">{lesson.title}</span>
                                      <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {lesson.duration_minutes} min
                                        </span>
                                        {lesson.is_preview && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase tracking-wide">
                                            Free Preview
                                            </span>
                                        )}
                                      </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                  onClick={() => handleDeleteLesson(module.id, lesson.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                        </div>

                        <Button
                          variant="outline"
                          className="w-full border-dashed border-slate-300 text-slate-500 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50 transition-all py-6 h-auto"
                          onClick={() => openAddLessonDialog(module.id)}
                        >
                          <PlusCircle className="mr-2 h-5 w-5" />
                          Add Lesson to Module
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                 <BookOpen className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No modules yet</h3>
              <p className="text-slate-500 max-w-sm mb-6">Star creating your curriculum by adding your first module.</p>
              <Button onClick={() => setModuleDialogOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create First Module
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Lesson Dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Add New Lesson</DialogTitle>
            <DialogDescription>Create a new lesson with video, text, or file content</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input
                placeholder="e.g., Variables and Data Types"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                className="font-medium"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select
                  value={lessonForm.content_type}
                  onValueChange={(value) => setLessonForm({ ...lessonForm, content_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Lesson</SelectItem>
                    <SelectItem value="text">Article / Text</SelectItem>
                    <SelectItem value="pdf">PDF Resource</SelectItem>
                    <SelectItem value="audio">Audio Clip</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={lessonForm.duration_minutes}
                    onChange={(e) =>
                        setLessonForm({ ...lessonForm, duration_minutes: Number.parseInt(e.target.value) || 0 })
                    }
                    className="pl-9"
                    />
                </div>
              </div>
            </div>

            {lessonForm.content_type === "text" ? (
              <div className="space-y-2">
                <Label>Content Text</Label>
                <Textarea
                  placeholder="Write your lesson content here using markdown..."
                  rows={8}
                  className="font-mono text-sm"
                  value={lessonForm.content_text || ""}
                  onChange={(e) => setLessonForm({ ...lessonForm, content_text: e.target.value })}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Content Source</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                     <Input
                        placeholder={lessonForm.content_type === "video" ? "https://youtube.com/..." : "https://..."}
                        value={lessonForm.content_url || ""}
                        onChange={(e) => setLessonForm({ ...lessonForm, content_url: e.target.value })}
                     />
                  </div>
                  <div className="relative px-2 py-1 bg-slate-100 rounded-md flex items-center justify-center text-xs text-slate-500 font-medium whitespace-nowrap">
                      OR
                  </div>
                  <label className="cursor-pointer">
                    <Button variant="outline" asChild disabled={uploadingFile} type="button">
                      <span>
                        {uploadingFile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                         Upload
                      </span>
                    </Button>
                    <input
                      type="file"
                      className="hidden"
                      accept={
                        lessonForm.content_type === "video"
                          ? "video/*"
                          : lessonForm.content_type === "audio"
                            ? "audio/*"
                            : lessonForm.content_type === "pdf"
                              ? ".pdf"
                              : "*"
                      }
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                <p className="text-xs text-slate-500">
                    Paste a URL (e.g., YouTube, Vimeo) or upload a file directly.
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50">
              <input
                type="checkbox"
                id="is_preview"
                checked={lessonForm.is_preview}
                onChange={(e) => setLessonForm({ ...lessonForm, is_preview: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <Label htmlFor="is_preview" className="text-sm font-medium cursor-pointer">
                Allow this lesson as a <strong>Free Preview</strong>
              </Label>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLesson} disabled={isLoading || !lessonForm.title} className="bg-slate-900 text-white">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
