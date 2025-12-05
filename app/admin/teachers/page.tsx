import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Users, BookOpen, MoreVertical, CheckCircle, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default async function AdminTeachersPage() {
  const supabase = await createClient()

  const { data: teachers } = await supabase
    .from("profiles")
    .select(`
      *,
      courses(count)
    `)
    .eq("role", "teacher")
    .order("created_at", { ascending: false })

  const allTeachers = teachers || []
  const verifiedTeachers = allTeachers.filter((t) => t.is_verified)
  const pendingTeachers = allTeachers.filter((t) => !t.is_verified)

  const TeacherList = ({ teacherList }: { teacherList: typeof allTeachers }) => (
    <div className="space-y-4">
      {teacherList.length > 0 ? (
        teacherList.map((teacher) => (
          <div
            key={teacher.id}
            className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
          >
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
                    {teacher.courses?.[0]?.count || 0} courses
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
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
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
                    <DropdownMenuItem className="text-emerald-600">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Verify
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No teachers found</h3>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Teacher Management</h1>
        <p className="text-muted-foreground mt-1">Verify and manage platform teachers</p>
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
              <TeacherList teacherList={allTeachers} />
            </TabsContent>
            <TabsContent value="pending">
              <TeacherList teacherList={pendingTeachers} />
            </TabsContent>
            <TabsContent value="verified">
              <TeacherList teacherList={verifiedTeachers} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
