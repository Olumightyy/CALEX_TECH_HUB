"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { verifyTeacher, rejectTeacher } from "@/lib/actions/teacher"

interface TeacherVerificationActionsProps {
  teacherId: string
}

export function TeacherVerificationActions({ teacherId }: TeacherVerificationActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectionForm, setShowRejectionForm] = useState(false)

  const handleVerify = async () => {
    setIsLoading(true)
    try {
      const result = await verifyTeacher(teacherId)

      if (result.success) {
        toast({ title: "Teacher verified successfully" })
        router.refresh()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
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
    try {
      const result = await rejectTeacher(teacherId, rejectionReason)

      if (result.success) {
        toast({ title: "Application rejected" })
        router.push("/admin/teachers")
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Verification Actions</CardTitle>
        <CardDescription>Approve or reject this teacher application</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showRejectionForm ? (
          <>
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleVerify} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Verify Teacher
            </Button>
            <Button
              variant="outline"
              className="w-full text-destructive border-destructive hover:bg-destructive/10 bg-transparent"
              onClick={() => setShowRejectionForm(true)}
              disabled={isLoading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject Application
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <Textarea
                placeholder="Explain why this application is being rejected..."
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
