import { NotificationList } from "@/components/notifications/notification-list"
import { CreateNotificationDialog } from "@/components/notifications/create-notification-dialog"
import { Bell } from "lucide-react"

export default function TeacherNotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-lg">
            <Bell className="h-5 w-5 text-amber-600" />
            </div>
            <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-slate-500">Manage announcements and view updates.</p>
            </div>
        </div>
        <CreateNotificationDialog userRole="teacher" />
      </div>
      
      <NotificationList />
    </div>
  )
}
