"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
import { deleteCourse } from "@/lib/actions/course"
import { toast } from "sonner"

interface DeleteCourseDialogProps {
  courseId: string
  courseTitle: string
  hasEnrollments?: boolean
  trigger?: React.ReactNode
}

export function DeleteCourseDialog({
  courseId,
  courseTitle,
  hasEnrollments = false,
  trigger,
}: DeleteCourseDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const router = useRouter()

  const handleDelete = async () => {
    if (confirmText !== courseTitle) {
      toast.error("Please type the course title correctly to confirm deletion")
      return
    }

    setIsDeleting(true)

    try {
      const result = await deleteCourse(courseId)

      if (result.success) {
        toast.success("Course deleted successfully")
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to delete course")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>Delete Course</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">This action cannot be undone.</AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4">
            <p className="text-sm text-foreground">
              You are about to permanently delete <strong>"{courseTitle}"</strong>. This will remove:
            </p>
            <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>All course modules and lessons</li>
              <li>All quizzes and student attempts</li>
              <li>All student progress data</li>
              <li>All course reviews and announcements</li>
              <li>All certificates issued for this course</li>
            </ul>
          </div>

          {hasEnrollments && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Warning:</strong> This course has enrolled students. Deleting it will affect their learning
                progress and certificates.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="confirm" className="text-sm font-medium">
              Type <span className="font-semibold text-foreground">"{courseTitle}"</span> to confirm
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Enter course title"
              className="font-mono"
              disabled={isDeleting}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting || confirmText !== courseTitle}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Course
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
