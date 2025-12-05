import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, CheckCircle, XCircle, UserCheck, BookOpen } from "lucide-react"

export default async function AdminLogsPage() {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from("admin_logs")
    .select(`
      *,
      profiles(full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(100)

  const getActionIcon = (action: string) => {
    if (action.includes("approved") || action.includes("verified")) {
      return <CheckCircle className="h-4 w-4 text-emerald-500" />
    }
    if (action.includes("rejected")) {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    if (action.includes("teacher")) {
      return <UserCheck className="h-4 w-4 text-blue-500" />
    }
    if (action.includes("course")) {
      return <BookOpen className="h-4 w-4 text-amber-500" />
    }
    return <FileText className="h-4 w-4 text-muted-foreground" />
  }

  const getActionBadge = (action: string) => {
    if (action.includes("approved") || action.includes("verified")) {
      return <Badge className="bg-emerald-100 text-emerald-700">Approved</Badge>
    }
    if (action.includes("rejected")) {
      return <Badge variant="destructive">Rejected</Badge>
    }
    return <Badge variant="secondary">{action.replace(/_/g, " ")}</Badge>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">Track all administrative actions on the platform</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Last 100 administrative actions</CardDescription>
        </CardHeader>
        <CardContent>
          {logs && logs.length > 0 ? (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="p-2 rounded-lg bg-background">{getActionIcon(log.action)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{log.profiles?.full_name || "Admin"}</span>
                      {getActionBadge(log.action)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {log.action.replace(/_/g, " ")} on {log.entity_type}
                    </p>
                    {log.details && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {typeof log.details === "object" ? JSON.stringify(log.details) : log.details}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No logs yet</h3>
              <p className="mt-2 text-muted-foreground">Administrative actions will be logged here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
