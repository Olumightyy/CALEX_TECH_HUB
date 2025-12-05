"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X, AlertCircle, Save, Send } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Category {
  id: string
  name: string
  slug: string
}

interface CourseFormProps {
  categories: Category[]
  initialData?: {
    id: string
    title: string
    slug: string
    description: string
    short_description: string
    category_id: string
    level: string
    price: number
    is_featured: boolean
    thumbnail_url: string | null
  }
}

export function CourseForm({ categories, initialData }: CourseFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initialData?.thumbnail_url || null)

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    short_description: initialData?.short_description || "",
    category_id: initialData?.category_id || "",
    level: initialData?.level || "beginner",
    price: initialData?.price || 0,
    is_featured: initialData?.is_featured || false,
  })

  const generateSlug = (title: string) => {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
    return `${baseSlug}-${Date.now()}`
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview(null)
  }

  const handleSubmit = async (action: "draft" | "submit") => {
    setError(null)

    if (!formData.title.trim()) {
      setError("Course title is required")
      return
    }

    if (!formData.description.trim()) {
      setError("Course description is required")
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      console.log("[v0] Starting course creation/update...")

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        throw new Error("Authentication error: " + authError.message)
      }

      if (!user) {
        throw new Error("Not authenticated. Please sign in again.")
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_verified")
        .eq("id", user.id)
        .single()

      if (profileError) {
        throw new Error("Could not verify your profile. Please try again.")
      }

      if (profile.role !== "teacher" && profile.role !== "admin") {
        throw new Error("Only teachers can create courses. Your role: " + profile.role)
      }

      let thumbnailUrl = initialData?.thumbnail_url || null

      if (thumbnailFile) {
        const fileExt = thumbnailFile.name.split(".").pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage.from("course-thumbnails").upload(fileName, thumbnailFile)

        if (uploadError) {
          console.log("[v0] Thumbnail upload error:", uploadError)
          toast({
            title: "Warning",
            description: "Thumbnail upload failed. You can add it later.",
            variant: "destructive",
          })
        } else {
          const {
            data: { publicUrl },
          } = supabase.storage.from("course-thumbnails").getPublicUrl(fileName)
          thumbnailUrl = publicUrl
        }
      }

      const slug = generateSlug(formData.title)
      const status = action === "submit" ? "pending_review" : "draft"

      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        short_description: formData.short_description.trim() || null,
        category_id: formData.category_id || null,
        level: formData.level,
        price: formData.price,
        is_featured: formData.is_featured,
        slug: initialData?.slug || slug, // Keep existing slug on update
        thumbnail_url: thumbnailUrl,
        teacher_id: user.id,
        status,
      }

      if (initialData?.id) {
        // Update existing course
        const { error } = await supabase.from("courses").update(courseData).eq("id", initialData.id)

        if (error) throw error

        toast({
          title: "Course updated",
          description:
            action === "submit" ? "Your course has been submitted for review" : "Your changes have been saved",
        })

        router.refresh()
      } else {
        // Create new course
        const { data: course, error } = await supabase.from("courses").insert(courseData).select().single()

        if (error) throw error

        toast({
          title: "Course created!",
          description:
            action === "submit" ? "Your course has been submitted for review" : "Your course draft has been saved",
        })

        router.push(`/teacher/courses/${course.id}`)
      }
    } catch (error: any) {
      console.log("[v0] Course creation failed:", error)
      const errorMessage = error.message || "Failed to save course"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {categories.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No categories available. Please contact an administrator to set up course categories.
          </AlertDescription>
        </Alert>
      )}

      {/* Thumbnail Upload */}
      <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-6">
        <div className="space-y-1">
            <Label className="text-base font-semibold text-slate-900">Course Thumbnail</Label>
            <p className="text-sm text-slate-500">Upload a compelling image to attract students.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {thumbnailPreview ? (
            <div className="relative group">
              <img
                src={thumbnailPreview || "/placeholder.svg"}
                alt="Thumbnail preview"
                className="w-64 h-36 rounded-lg object-cover border border-slate-200 shadow-sm"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={removeThumbnail}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-64 h-36 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-white hover:border-amber-500 transition-all group">
              <div className="p-3 bg-white rounded-full shadow-sm mb-2 group-hover:shadow-md transition-shadow">
                 <Upload className="h-5 w-5 text-slate-400 group-hover:text-amber-500" />
              </div>
              <span className="text-sm font-medium text-slate-600 group-hover:text-amber-600">Click to upload</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailChange} />
            </label>
          )}
          <div className="text-sm text-slate-500 space-y-1 pt-2">
            <p className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Recommended size: 1280x720px (16:9)</p>
            <p className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Max file size: 5MB</p>
            <p className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Supported: JPG, PNG, WebP</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Title */}
        <div className="space-y-2">
            <Label htmlFor="title">Course Title <span className="text-red-500">*</span></Label>
            <Input
            id="title"
            placeholder="e.g., Complete Web Development Bootcamp"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className="text-lg font-medium"
            />
        </div>

        {/* Short Description */}
        <div className="space-y-2">
            <Label htmlFor="short_description">Short Description</Label>
            <Input
            id="short_description"
            placeholder="A brief catchy tagline for your course card"
            maxLength={200}
            value={formData.short_description}
            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            />
            <p className="text-xs text-right text-slate-400">{formData.short_description.length}/200</p>
        </div>

        {/* Full Description */}
        <div className="space-y-2">
            <Label htmlFor="description">Full Description <span className="text-red-500">*</span></Label>
            <Textarea
            id="description"
            placeholder="Detailed description of what students will learn, requirements, and curriculum overview..."
            rows={8}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            className="resize-y min-h-[150px]"
            />
        </div>

        {/* Category & Level & Price */}
        <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
            <Label>Category</Label>
            <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
                <SelectTrigger>
                <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                    {category.name}
                    </SelectItem>
                ))}
                </SelectContent>
            </Select>
            </div>

            <div className="space-y-2">
            <Label>Difficulty Level</Label>
            <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                <SelectTrigger>
                <SelectValue />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
            </Select>
            </div>

            <div className="space-y-2">
            <Label htmlFor="price">Price (NGN)</Label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₦</span>
                <Input
                id="price"
                type="number"
                min="0"
                step="100"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
                className="pl-8"
                />
            </div>
            <p className="text-xs text-slate-500">Set to 0 for a free course</p>
            </div>
        </div>

        {/* Featured - Only Admin typically, but keeping for now as per original code */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 bg-slate-50/50">
            <div className="space-y-0.5">
            <Label>Request Featured Status</Label>
            <p className="text-sm text-slate-500">
                Featured courses appear on the homepage (subject to admin approval)
            </p>
            </div>
            <Switch
            checked={formData.is_featured}
            onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
            className="data-[state=checked]:bg-amber-500"
            />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
        <Button type="button" variant="outline" disabled={isLoading} onClick={() => handleSubmit("draft")} className="border-slate-200 hover:bg-slate-50">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save as Draft
        </Button>
        <Button
          type="button"
          disabled={isLoading || !formData.title || !formData.description}
          onClick={() => handleSubmit("submit")}
          className="bg-slate-900 hover:bg-slate-800 text-white shadow-md"
        >
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          {initialData ? "Save Changes" : "Submit for Review"}
        </Button>
      </div>
    </form>
  )
}
