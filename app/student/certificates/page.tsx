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
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">My Certificates</h1>
        <p className="text-sm text-muted-foreground sm:text-base">View and download your earned certificates.</p>
      </div>

      {certificates.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
          <Award className="mb-4 h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
          <h3 className="mb-2 text-base sm:text-lg font-semibold">No certificates yet</h3>
          <p className="mb-4 text-sm text-muted-foreground px-4">Complete a course to earn your first certificate.</p>
          <Button asChild>
            <Link href="/student/my-courses">View My Courses</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          {certificates.map((cert) => (
            <Card key={cert.id} className="overflow-hidden">
              {/* Certificate Preview */}
              <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-4 sm:p-6">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent)]" />
                <div className="relative flex h-full flex-col items-center justify-center text-center text-primary-foreground">
                  <Award className="mb-2 h-8 w-8 sm:h-12 sm:w-12" />
                  <p className="mb-1 text-[10px] sm:text-xs uppercase tracking-wider opacity-80">
                    Certificate of Completion
                  </p>
                  <h3 className="mb-2 line-clamp-2 text-xs sm:text-sm font-semibold">{cert.course_title}</h3>
                  <p className="text-[10px] sm:text-xs opacity-80">Awarded to {cert.student_name}</p>
                </div>
              </div>

              <CardContent className="p-3 sm:p-4">
                <div className="mb-3 sm:mb-4 space-y-1">
                  <p className="text-xs sm:text-sm">
                    <span className="text-muted-foreground">ID:</span>{" "}
                    <span className="font-mono text-[10px] sm:text-xs">{cert.certificate_number}</span>
                  </p>
                  <p className="text-xs sm:text-sm">
                    <span className="text-muted-foreground">Issued:</span>{" "}
                    {new Date(cert.issued_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs sm:text-sm truncate">
                    <span className="text-muted-foreground">Instructor:</span> {cert.teacher_name}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button size="sm" className="flex-1">
                    <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Download
                  </Button>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 sm:flex-none bg-transparent">
                      <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 sm:flex-none bg-transparent" asChild>
                      <Link href={`/certificates/verify?id=${cert.certificate_number}`}>
                        <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
