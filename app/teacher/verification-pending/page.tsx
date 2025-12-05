import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, ArrowLeft, Mail } from "lucide-react"

export default function VerificationPendingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy-50 to-white p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-100">
            <Clock className="h-8 w-8 text-gold-600" />
          </div>
          <CardTitle className="text-2xl">Verification Pending</CardTitle>
          <CardDescription className="text-base">Your teacher account is awaiting verification</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Our team is reviewing your application. This typically takes 2-3 business days. You&apos;ll receive an email
            once your account is verified.
          </p>
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>Check your email for updates</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
