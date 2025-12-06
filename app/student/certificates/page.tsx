import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Download, ExternalLink, Share2 } from "lucide-react"

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Certificates</h1>
        <p className="text-muted-foreground">View and download your earned certificates.</p>
      </div>

      {certificates.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <Award className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">No certificates yet</h3>
          <p className="mb-4 text-muted-foreground">Complete a course to earn your first certificate.</p>
          <Button asChild>
            <Link href="/student/my-courses">View My Courses</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((cert) => (
            <Card key={cert.id} className="overflow-hidden">
              {/* Certificate Preview */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-navy-800 via-navy-700 to-navy-900 p-6">
                <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-10" />
                <div className="relative flex h-full flex-col items-center justify-center text-center text-white">
                  <Award className="mb-3 h-12 w-12 text-gold-400" />
                  <p className="mb-1 text-xs uppercase tracking-wider text-gold-400">Certificate of Completion</p>
                  <h3 className="mb-2 line-clamp-2 text-sm font-semibold">{cert.course_title}</h3>
                  <p className="text-xs text-navy-200">Awarded to {cert.student_name}</p>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="mb-4 space-y-1">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Certificate ID:</span>{" "}
                    <span className="font-mono text-xs">{cert.certificate_number}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Issued:</span>{" "}
                    {new Date(cert.issued_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Instructor:</span> {cert.teacher_name}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" asChild>
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
