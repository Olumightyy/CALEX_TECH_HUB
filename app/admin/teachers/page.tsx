import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, AlertCircle } from "lucide-react"
import { getTeachers } from "@/lib/actions/teacher"
import { TeacherListItem } from "@/components/admin/teacher-list-item"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

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

export default async function AdminTeachersPage() {
  const result = await getTeachers()

  if (!result.success) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Teacher Management</h1>
          <p className="text-muted-foreground mt-1">Verify and manage platform teachers</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading teachers</AlertTitle>
          <AlertDescription>{result.error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const allTeachers: Teacher[] = result.data || []
  const verifiedTeachers = allTeachers.filter((t) => t.is_verified)
  const pendingTeachers = allTeachers.filter((t) => !t.is_verified)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Teacher Management</h1>
        <p className="text-muted-foreground mt-1">Verify and manage platform teachers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Teachers</p>
                <p className="text-2xl font-bold">{allTeachers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-100">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold">{verifiedTeachers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-100">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingTeachers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All ({allTeachers.length})</TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                Pending ({pendingTeachers.length})
                {pendingTeachers.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="verified">Verified ({verifiedTeachers.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <TeacherList teachers={allTeachers} />
            </TabsContent>
            <TabsContent value="pending">
              <TeacherList teachers={pendingTeachers} emptyMessage="No pending verifications" />
            </TabsContent>
            <TabsContent value="verified">
              <TeacherList teachers={verifiedTeachers} emptyMessage="No verified teachers yet" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function TeacherList({ teachers, emptyMessage = "No teachers found" }: { teachers: Teacher[]; emptyMessage?: string }) {
  if (teachers.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">{emptyMessage}</h3>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {teachers.map((teacher) => (
        <TeacherListItem key={teacher.id} teacher={teacher} />
      ))}
    </div>
  )
}
