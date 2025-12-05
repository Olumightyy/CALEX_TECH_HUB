"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

interface CourseApprovalActionsProps {
  courseId: string
}

export function CourseApprovalActions({ courseId }: CourseApprovalActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectionForm, setShowRejectionForm] = useState(false)

  const handleApprove = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error } = await supabase
        .from("courses")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
        })
        .eq("id", courseId)

      if (error) throw error

      // Log admin action
      await supabase.from("admin_logs").insert({
        admin_id: user?.id,
        action: "course_approved",
        entity_type: "course",
        entity_id: courseId,
        details: { action: "Course approved and published" },
      })

      toast({ title: "Course approved and published" })
      router.refresh()
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({ title: "Please provide a rejection reason", variant: "destructive" })
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error } = await supabase
        .from("courses")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason,
        })
        .eq("id", courseId)

      if (error) throw error

      // Log admin action
      await supabase.from("admin_logs").insert({
        admin_id: user?.id,
        action: "course_rejected",
        entity_type: "course",
        entity_id: courseId,
        details: { reason: rejectionReason },
      })

      toast({ title: "Course rejected" })
      router.push("/admin/courses")
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Review Actions</CardTitle>
        <CardDescription>Approve or reject this course submission</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showRejectionForm ? (
          <>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleApprove} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Approve & Publish
            </Button>
            <Button
              variant="outline"
              className="w-full text-destructive border-destructive hover:bg-destructive/10 bg-transparent"
              onClick={() => setShowRejectionForm(true)}
              disabled={isLoading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject Course
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Textarea
                placeholder="Explain why this course is being rejected..."
                rows={4}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setShowRejectionForm(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleReject} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Reject
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
