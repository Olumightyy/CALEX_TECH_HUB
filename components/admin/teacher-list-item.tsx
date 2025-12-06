"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { BookOpen, MoreVertical, CheckCircle, Eye, XCircle, Loader2 } from "lucide-react"
import { verifyTeacher } from "@/lib/actions/teacher"

interface Teacher {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  is_verified: boolean
  verification_status: string | null
  created_at: string
  course_count?: number
}

export function TeacherListItem({ teacher }: { teacher: Teacher }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isVerifying, setIsVerifying] = useState(false)

  const handleQuickVerify = async () => {
    setIsVerifying(true)
    try {
      const result = await verifyTeacher(teacher.id)
      if (result.success) {
        toast({ title: "Teacher verified successfully" })
        router.refresh()
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {teacher.avatar_url ? (
          <img
            src={teacher.avatar_url || "/placeholder.svg"}
            alt={teacher.full_name || ""}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">{teacher.full_name?.charAt(0) || "T"}</span>
          </div>
        )}
        <div>
          <h3 className="font-semibold text-foreground">{teacher.full_name || "Unknown"}</h3>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span>{teacher.email}</span>
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {teacher.course_count || 0} courses
            </span>
            <span>Joined {new Date(teacher.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {teacher.is_verified ? (
          <Badge className="bg-emerald-100 text-emerald-700">Verified</Badge>
        ) : (
          <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isVerifying}>
              {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/teachers/${teacher.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </Link>
            </DropdownMenuItem>
            {!teacher.is_verified && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-emerald-600" onClick={handleQuickVerify} disabled={isVerifying}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Quick Verify
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/admin/teachers/${teacher.id}`} className="text-destructive">
                    <XCircle className="mr-2 h-4 w-4" />
                    Review & Reject
                  </Link>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
