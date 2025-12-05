"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Notification } from "@/lib/types/database"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, Check, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

export function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchNotifications()
    
    // Subscribe to new notifications
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, 
        (payload) => {
             // In a real app we check payload.new.user_id === auth.user.id
             // But for simplicity we just refresh.
             fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
    
    if (data) setNotifications(data)
    setIsLoading(false)
  }

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id)
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAllAsRead = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id)
      setNotifications(notifications.map(n => ({ ...n, is_read: true })))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="h-5 w-5 text-emerald-500" />
      case "warning": return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "error": return <XCircle className="h-5 w-5 text-red-500" />
      default: return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  if (isLoading) {
      return <div className="p-8 text-center text-slate-500">Loading notifications...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
         <h3 className="font-semibold text-slate-900">Recent Notifications</h3>
         {notifications.some(n => !n.is_read) && (
             <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs text-amber-600">
                 Mark all as read
             </Button>
         )}
      </div>

      {notifications.length > 0 ? (
        notifications.map((notification) => (
          <Card key={notification.id} className={`border-0 shadow-sm ${notification.is_read ? 'bg-white' : 'bg-blue-50/50'}`}>
            <CardContent className="p-4 flex gap-4">
              <div className="mt-1">{getIcon(notification.type)}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                    <h4 className={`text-sm font-semibold ${notification.is_read ? 'text-slate-700' : 'text-slate-900'}`}>{notification.title}</h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{notification.message}</p>
                {!notification.is_read && (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700 mt-2"
                        onClick={() => markAsRead(notification.id)}
                    >
                        Mark as read
                    </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-200">
            <Bell className="h-8 w-8 mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500">No notifications yet</p>
        </div>
      )}
    </div>
  )
}
