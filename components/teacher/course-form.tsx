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
import { Loader2, Upload, X, AlertCircle } from "lucide-react"
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
        console.log("[v0] Auth error:", authError)
        throw new Error("Authentication error: " + authError.message)
      }

      if (!user) {
        console.log("[v0] No user found")
        throw new Error("Not authenticated. Please sign in again.")
      }

      console.log("[v0] User authenticated:", user.id)

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, is_verified")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.log("[v0] Profile error:", profileError)
        throw new Error("Could not verify your profile. Please try again.")
      }

      console.log("[v0] User profile:", profile)

      if (profile.role !== "teacher" && profile.role !== "admin") {
        throw new Error("Only teachers can create courses. Your role: " + profile.role)
      }

      let thumbnailUrl = initialData?.thumbnail_url || null

      if (thumbnailFile) {
        console.log("[v0] Uploading thumbnail...")
        const fileExt = thumbnailFile.name.split(".").pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage.from("course-thumbnails").upload(fileName, thumbnailFile)

        if (uploadError) {
          console.log("[v0] Thumbnail upload error:", uploadError)
          // Don't block course creation if thumbnail fails
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
          console.log("[v0] Thumbnail uploaded:", thumbnailUrl)
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
        slug,
        thumbnail_url: thumbnailUrl,
        teacher_id: user.id,
        status,
      }

      console.log("[v0] Course data to save:", courseData)

      if (initialData?.id) {
        // Update existing course
        console.log("[v0] Updating existing course:", initialData.id)
        const { error } = await supabase.from("courses").update(courseData).eq("id", initialData.id)

        if (error) {
          console.log("[v0] Update error:", error)
          throw error
        }

        toast({
          title: "Course updated",
          description:
            action === "submit" ? "Your course has been submitted for review" : "Your changes have been saved",
        })

        router.refresh()
      } else {
        // Create new course
        console.log("[v0] Creating new course...")
        const { data: course, error } = await supabase.from("courses").insert(courseData).select().single()

        if (error) {
          console.log("[v0] Insert error:", error)
          throw error
        }

        console.log("[v0] Course created successfully:", course)

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
    <form className="space-y-6">
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
      <div className="space-y-2">
        <Label>Course Thumbnail (Optional)</Label>
        <div className="flex items-start gap-4">
          {thumbnailPreview ? (
            <div className="relative">
              <img
                src={thumbnailPreview || "/placeholder.svg"}
                alt="Thumbnail preview"
                className="w-48 h-32 rounded-lg object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6"
                onClick={removeThumbnail}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Upload image</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleThumbnailChange} />
            </label>
          )}
          <div className="text-sm text-muted-foreground">
            <p>Recommended size: 1280x720px</p>
            <p>Max file size: 5MB</p>
            <p>Formats: JPG, PNG, WebP</p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Course Title *</Label>
        <Input
          id="title"
          placeholder="e.g., Complete Web Development Bootcamp"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      {/* Short Description */}
      <div className="space-y-2">
        <Label htmlFor="short_description">Short Description</Label>
        <Input
          id="short_description"
          placeholder="A brief one-line description"
          maxLength={200}
          value={formData.short_description}
          onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">{formData.short_description.length}/200 characters</p>
      </div>

      {/* Full Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Full Description *</Label>
        <Textarea
          id="description"
          placeholder="Detailed description of what students will learn..."
          rows={6}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      {/* Category & Level */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
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
          <Label>Level</Label>
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
      </div>

      {/* Price */}
      <div className="space-y-2">
        <Label htmlFor="price">Price (USD)</Label>
        <Input
          id="price"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
        />
        <p className="text-xs text-muted-foreground">Set to 0 for a free course</p>
      </div>

      {/* Featured */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label>Request Featured Status</Label>
          <p className="text-sm text-muted-foreground">
            Featured courses appear on the homepage (subject to admin approval)
          </p>
        </div>
        <Switch
          checked={formData.is_featured}
          onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="outline" disabled={isLoading} onClick={() => handleSubmit("draft")}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save as Draft
        </Button>
        <Button
          type="button"
          disabled={isLoading || !formData.title || !formData.description}
          onClick={() => handleSubmit("submit")}
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit for Review
        </Button>
      </div>
    </form>
  )
}
