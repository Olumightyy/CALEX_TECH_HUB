import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShieldCheck, CheckCircle, XCircle, Clock, FileText, Phone, Mail, User, Linkedin, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export default async function TeacherVerificationsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect("/auth/login")

  // Check if admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  
  if (profile?.role !== 'admin') return redirect("/")

  // Fetch Applications
  const { data: applications } = await supabase
    .from("teacher_applications")
    .select("*")
    .order("created_at", { ascending: false })

  // Fetch PROFILES for approved teachers (source of truth)
  const { data: approvedProfiles } = await supabase
    .from("profiles")
    .select("*, teacher_applications(*)")
    .eq("role", "teacher")
    .eq("is_verified", true)

  const pendingApps = applications?.filter(app => app.status === "pending") || []
  const rejectedApps = applications?.filter(app => app.status === "rejected") || []
  
  // Transform approved profiles to match the display shape or use a unified shape
  const approvedTeachers = approvedProfiles?.map(profile => {
      // Use application data if available, otherwise fallback to profile data
      const app = profile.teacher_applications?.[0] || {}
      return {
          id: app.id || `profile-${profile.id}`, // fallback ID
          user_id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          status: "approved",
          expertise: app.expertise || "N/A",
          experience_years: app.experience_years || 0,
          qualifications: app.qualifications || "Verified Teacher",
          portfolio_url: app.portfolio_url,
          linkedin_url: app.linkedin_url,
          reason: app.reason || "Manually verified or legacy account",
          avatar_url: profile.avatar_url
      }
  }) || []

  const approveApplication = async (formData: FormData) => {
    "use server"
    const appId = formData.get("appId") as string
    const userId = formData.get("userId") as string
    if (!appId || !userId) return

    const supabase = await createClient()
    
    // 1. Update application status
    await supabase
      .from("teacher_applications")
      .update({ 
        status: "approved", 
        reviewed_at: new Date().toISOString() 
      })
      .eq("id", appId)

    // 2. Update user profile verification status
    await supabase
      .from("profiles")
      .update({ 
        is_verified: true, 
        verification_status: "approved"
      })
      .eq("id", userId)

    // 3. Send notification (if system exists)
    await supabase.from("notifications").insert({
        user_id: userId,
        title: "Teacher Application Approved",
        message: "Your application to become a verified teacher has been approved! You can now create courses.",
        type: "success"
    })

    revalidatePath("/admin/verifications")
  }

  const rejectApplication = async (formData: FormData) => {
    "use server"
    const appId = formData.get("appId") as string
    const userId = formData.get("userId") as string
    if (!appId) return

    const supabase = await createClient()
    
    await supabase
      .from("teacher_applications")
      .update({ 
        status: "rejected", 
        reviewed_at: new Date().toISOString() 
      })
      .eq("id", appId)

    await supabase
        .from("profiles")
        .update({ 
            verification_status: "rejected"
        })
        .eq("id", userId)

    await supabase.from("notifications").insert({
        user_id: userId,
        title: "Teacher Application Update",
        message: "Your application to become a teacher was not approved at this time. Please contact support for more details.",
        type: "error"
    })

    revalidatePath("/admin/verifications")
  }

  const ApplicationCard = ({ app }: { app: any }) => (
    <Card key={app.id} className="border-0 shadow-sm border-l-4 border-l-transparent hover:border-l-amber-500 transition-all">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                    {app.full_name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{app.full_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Mail className="h-3 w-3" /> {app.email}
                  </div>
                </div>
              </div>
              <Badge variant={app.status === 'pending' ? 'secondary' : app.status === 'approved' ? 'default' : 'destructive'}>
                {app.status.toUpperCase()}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
                    <p className="font-semibold text-slate-700 flex items-center gap-2">
                        <Briefcase className="h-3.5 w-3.5" /> Expertise & Experience
                    </p>
                    <p><span className="text-slate-500">Field:</span> {app.expertise}</p>
                    <p><span className="text-slate-500">Years:</span> {app.experience_years} years</p>
                    <p><span className="text-slate-500">Qualifications:</span> {app.qualifications}</p>
                </div>
                <div className="space-y-2 p-3 bg-slate-50 rounded-lg">
                    <p className="font-semibold text-slate-700 flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5" /> Additional Info
                    </p>
                    {app.portfolio_url && (
                        <p className="truncate"><a href={app.portfolio_url} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1">Portfolio <span className="text-xs">↗</span></a></p>
                    )}
                    {app.linkedin_url && (
                        <p className="truncate"><a href={app.linkedin_url} target="_blank" className="text-blue-600 hover:underline flex items-center gap-1">LinkedIn <span className="text-xs">↗</span></a></p>
                    )}
                    <p className="italic text-slate-500 mt-2">"{app.reason}"</p>
                </div>
            </div>
          </div>

          {app.status === 'pending' && (
             <div className="flex flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                <form action={approveApplication}>
                    <input type="hidden" name="appId" value={app.id} />
                    <input type="hidden" name="userId" value={app.user_id} />
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" type="submit">
                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                    </Button>
                </form>
                <form action={rejectApplication}>
                    <input type="hidden" name="appId" value={app.id} />
                    <input type="hidden" name="userId" value={app.user_id} />
                    <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" type="submit">
                        <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                </form>
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
            <ShieldCheck className="h-6 w-6 text-blue-600" />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-slate-900">Teacher Verifications</h1>
            <p className="text-slate-500">Review and verify teacher applications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-blue-50 border-blue-100">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                   <p className="text-sm font-medium text-blue-600">Pending Review</p>
                   <p className="text-2xl font-bold text-blue-900">{pendingApps.length}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-300" />
            </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                   <p className="text-sm font-medium text-emerald-600">Approved Teachers</p>
                   <p className="text-2xl font-bold text-emerald-900">{approvedTeachers.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-300" />
            </CardContent>
        </Card>
        <Card className="bg-slate-50 border-slate-100">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                   <p className="text-sm font-medium text-slate-600">Total Applications</p>
                   <p className="text-2xl font-bold text-slate-900">{applications?.length || 0}</p>
                </div>
                <Users className="h-8 w-8 text-slate-300" />
            </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-white border border-slate-200 p-1 rounded-xl w-full sm:w-auto h-auto shadow-sm">
          <TabsTrigger value="pending" className="flex-1 sm:flex-none rounded-lg px-6 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Pending ({pendingApps.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex-1 sm:flex-none rounded-lg px-6 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Approved ({approvedTeachers.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex-1 sm:flex-none rounded-lg px-6 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
            Rejected ({rejectedApps.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6 space-y-4">
           {pendingApps.length > 0 ? (
             pendingApps.map(app => <ApplicationCard key={app.id} app={app} />)
           ) : (
             <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                <CheckCircle className="h-12 w-12 text-emerald-200 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
                <p className="text-slate-500">No pending applications to review.</p>
             </div>
           )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6 space-y-4">
           {approvedTeachers.map(app => <ApplicationCard key={app.id} app={app} />)}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6 space-y-4">
           {rejectedApps.map(app => <ApplicationCard key={app.id} app={app} />)}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Users(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }
