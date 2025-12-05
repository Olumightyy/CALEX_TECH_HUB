import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TeacherSettingsForm } from "@/components/teacher/settings-form"

export default async function TeacherSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your teacher profile and preferences</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your public teacher profile</CardDescription>
        </CardHeader>
        <CardContent>
          <TeacherSettingsForm
            profile={{
              full_name: profile?.full_name || "",
              bio: profile?.bio || "",
              avatar_url: profile?.avatar_url || "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
