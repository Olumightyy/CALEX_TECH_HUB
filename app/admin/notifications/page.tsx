import { NotificationList } from "@/components/notifications/notification-list"
import { CreateNotificationDialog } from "@/components/notifications/create-notification-dialog"
import { Bell } from "lucide-react"

export default function AdminNotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
            <h1 className="text-2xl font-bold text-slate-900">System Notifications</h1>
            <p className="text-slate-500">Send broadcasts to users and view system alerts.</p>
            </div>
        </div>
        <CreateNotificationDialog userRole="admin" />
      </div>
      
      <NotificationList />
    </div>
  )
}
