import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Mail, ArrowRight } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 sm:h-16 sm:w-16">
            <Mail className="h-7 w-7 text-primary sm:h-8 sm:w-8" />
          </div>
          <CardTitle className="text-xl sm:text-2xl">Check your email</CardTitle>
          <CardDescription className="text-sm sm:text-base">We&apos;ve sent you a verification code</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 sm:space-y-6">
          <p className="text-sm text-muted-foreground sm:text-base">
            Enter the 6-digit code sent to your email to verify your account and start learning.
          </p>
          <div className="rounded-lg bg-muted p-3 sm:p-4">
            <p className="text-xs text-muted-foreground sm:text-sm">
              Didn&apos;t receive the code? Check your spam folder or go back to resend.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:gap-3">
            <Button asChild>
              <Link href="/auth/sign-up">
                Enter Verification Code
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <GraduationCap className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
