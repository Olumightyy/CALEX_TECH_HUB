import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Download, ExternalLink, Share2, Shield } from "lucide-react"

async function getCertificates(userId: string) {
  const supabase = await createClient()

  const { data } = await supabase
    .from("certificates")
    .select(`
      *,
      course:courses(slug, thumbnail_url)
    `)
    .eq("student_id", userId)
    .order("issued_at", { ascending: false })

  return data || []
}

export default async function CertificatesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const certificates = await getCertificates(user.id)

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <div className="bg-amber-100 p-2 rounded-lg">
                  <Award className="h-5 w-5 text-amber-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">My Certificates</h1>
           </div>
           <p className="text-slate-500 max-w-2xl">
             View and download your earned credentials.
           </p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
          <div className="bg-slate-50 p-6 rounded-full mb-4">
             <Award className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-slate-900">No certificates yet</h3>
          <p className="mb-8 text-slate-500 max-w-md">
            Complete a course to earn your first certificate. Keep learning!
          </p>
          <Button asChild size="lg" className="bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg">
            <Link href="/student/my-courses">Go to My Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <Card key={cert.id} className="overflow-hidden border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
              {/* Certificate Preview */}
              <div className="relative aspect-[4/3] bg-slate-900 p-6 flex flex-col items-center justify-center text-center border-b border-amber-500/20 group-hover:border-amber-500 transition-colors">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950 opacity-100" />
                <div className="relative z-10 flex flex-col items-center">
                    <div className="mb-4 h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                        <Award className="h-8 w-8 text-amber-500" />
                    </div>
                    <p className="mb-2 text-xs uppercase tracking-[0.2em] text-amber-500 font-medium">Certificate of Completion</p>
                    <h3 className="mb-1 text-white font-bold text-lg leading-tight px-4">{cert.course_title}</h3>
                    <div className="mt-4 flex items-center gap-2">
                       <Shield className="h-3 w-3 text-slate-400" />
                       <span className="text-[10px] text-slate-400 uppercase tracking-widest">Verified Credential</span>
                    </div>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="mb-6 space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Student</span>
                    <span className="font-semibold text-slate-900">{cert.student_name}</span>
                  </div>
                   <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-2">
                    <span className="text-slate-500">Issued</span>
                    <span className="font-medium text-slate-900">{new Date(cert.issued_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500">ID</span>
                     <span className="font-mono text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">{cert.certificate_number}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button size="sm" className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold shadow-sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50" asChild>
                    <Link href={`/certificates/verify?id=${cert.certificate_number}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
