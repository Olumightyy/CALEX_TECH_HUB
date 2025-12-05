"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Bell, Loader2, Send } from "lucide-react"

interface CreateNotificationDialogProps {
  userRole: "admin" | "teacher"
}

export function CreateNotificationDialog({ userRole }: CreateNotificationDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    target_role: "student", // student, teacher, or specific user (not implemented for simplicity yet)
    type: "info"
  })

  const handleCreate = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      // 1. Fetch target users based on role
      // This is a simplified approach. In a real app, we might insert one record for "all students" 
      // or use a separate "announcements" table. 
      // BUT for "notifications", we usually insert per user.
      // If we have thousands of users, this is bad. 
      // Given the prompt "create a notification for students", I will assume we want to ONE-OFF notification or broadcast.
      // For scalability, I'll fetch IDs and insert. 
      // Note: This might timeout if too many users. A real production app would use Edge Functions.
      
      let query = supabase.from("profiles").select("id")
      
      if (formData.target_role === "student") {
        query = query.eq("role", "student")
      } else if (formData.target_role === "teacher") {
        query = query.eq("role", "teacher")
      }

      const { data: users, error: fetchError } = await query
      
      if (fetchError) throw fetchError
      if (!users || users.length === 0) throw new Error("No users found for this role")

      // 2. Insert notifications
      const notifications = users.map(user => ({
        user_id: user.id,
        title: formData.title,
        message: formData.message,
        type: formData.type,
        is_read: false
      }))

      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notifications)

      if (insertError) throw insertError

      toast({ title: `Sent to ${users.length} users` })
      setOpen(false)
      setFormData({ title: "", message: "", target_role: "student", type: "info" })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-900 text-white hover:bg-slate-800">
          <Send className="mr-2 h-4 w-4" />
          Send Notification
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Notification</DialogTitle>
          <DialogDescription>
            Send a message to {userRole === "admin" ? "students or teachers" : "students"}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Notification Title"
            />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea 
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              placeholder="The content of the notification..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select 
                  value={formData.target_role} 
                  onValueChange={(val) => setFormData({...formData, target_role: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Values Students</SelectItem>
                    {userRole === "admin" && (
                         <SelectItem value="teacher">Teachers Only</SelectItem>
                    )}
                  </SelectContent>
                </Select>
             </div>
             <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(val) => setFormData({...formData, type: val})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                  </SelectContent>
                </Select>
             </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={isLoading || !formData.title || !formData.message}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
