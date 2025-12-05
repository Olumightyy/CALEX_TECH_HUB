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
import { PlusCircle, GripVertical, Trash2, Edit, Video, FileText, File, Loader2, Upload } from "lucide-react"

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
        return <Video className="h-4 w-4" />
      case "text":
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Course Curriculum</CardTitle>
            <CardDescription>Organize your course into modules and lessons</CardDescription>
          </div>
          <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingModule(null)
                  setModuleForm({ title: "", description: "" })
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Module
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingModule ? "Edit Module" : "Add New Module"}</DialogTitle>
                <DialogDescription>
                  {editingModule ? "Update module details" : "Create a new module for your course"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="module-title">Module Title</Label>
                  <Input
                    id="module-title"
                    placeholder="e.g., Introduction to JavaScript"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="module-description">Description (Optional)</Label>
                  <Textarea
                    id="module-description"
                    placeholder="Brief description of this module"
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={editingModule ? handleUpdateModule : handleAddModule}
                  disabled={isLoading || !moduleForm.title}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingModule ? "Update" : "Add"} Module
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {modules.length > 0 ? (
            <Accordion type="multiple" className="space-y-4">
              {modules
                .sort((a, b) => a.position - b.position)
                .map((module, index) => (
                  <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">Module {index + 1}</span>
                        <span className="font-semibold">{module.title}</span>
                        <span className="text-sm text-muted-foreground">({module.lessons.length} lessons)</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="space-y-4">
                        {module.description && <p className="text-sm text-muted-foreground">{module.description}</p>}

                        <div className="flex items-center gap-2 mb-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingModule(module)
                              setModuleForm({
                                title: module.title,
                                description: module.description || "",
                              })
                              setModuleDialogOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-3 w-3" />
                            Edit Module
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive bg-transparent"
                            onClick={() => handleDeleteModule(module.id)}
                          >
                            <Trash2 className="mr-2 h-3 w-3" />
                            Delete
                          </Button>
                        </div>

                        {/* Lessons List */}
                        <div className="space-y-2">
                          {module.lessons
                            .sort((a, b) => a.position - b.position)
                            .map((lesson, lessonIndex) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                              >
                                <div className="flex items-center gap-3">
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  {getContentIcon(lesson.content_type)}
                                  <span className="font-medium">{lesson.title}</span>
                                  {lesson.is_preview && (
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                      Preview
                                    </span>
                                  )}
                                  <span className="text-sm text-muted-foreground">{lesson.duration_minutes} min</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => handleDeleteLesson(module.id, lesson.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                        </div>

                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => openAddLessonDialog(module.id)}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Lesson
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No modules yet</h3>
              <p className="mt-2 text-muted-foreground">Start building your curriculum by adding modules</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Lesson Dialog */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Lesson</DialogTitle>
            <DialogDescription>Create a new lesson with video, text, or file content</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input
                placeholder="e.g., Variables and Data Types"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="text">Text/Article</SelectItem>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duration (minutes)</Label>
                <Input
                  type="number"
                  min="0"
                  value={lessonForm.duration_minutes}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, duration_minutes: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            {lessonForm.content_type === "text" ? (
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  placeholder="Write your lesson content here..."
                  rows={6}
                  value={lessonForm.content_text}
                  onChange={(e) => setLessonForm({ ...lessonForm, content_text: e.target.value })}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Upload File or Enter URL</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://..."
                    value={lessonForm.content_url}
                    onChange={(e) => setLessonForm({ ...lessonForm, content_url: e.target.value })}
                  />
                  <label className="cursor-pointer">
                    <Button variant="outline" asChild disabled={uploadingFile}>
                      <span>
                        {uploadingFile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
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
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_preview"
                checked={lessonForm.is_preview}
                onChange={(e) => setLessonForm({ ...lessonForm, is_preview: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="is_preview" className="text-sm font-normal">
                Allow this lesson as free preview
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLesson} disabled={isLoading || !lessonForm.title}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Lesson
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
