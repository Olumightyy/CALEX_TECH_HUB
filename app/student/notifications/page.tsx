import { NotificationList } from "@/components/notifications/notification-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell } from "lucide-react"

export default function StudentNotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-amber-100 rounded-lg">
          <Bell className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500">Updates on your courses, achievements, and system messages.</p>
        </div>
      </div>
      
      <NotificationList />
    </div>
  )
}
