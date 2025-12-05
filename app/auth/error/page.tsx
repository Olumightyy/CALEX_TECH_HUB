import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  const errorMessages: Record<string, string> = {
    auth_callback_error: "There was a problem verifying your email. The link may have expired.",
    access_denied: "Access was denied. Please try signing in again.",
    default: "An authentication error occurred. Please try again.",
  }

  const errorMessage = errorMessages[params.error || "default"] || errorMessages.default

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-navy-50 to-white p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription className="text-base">{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {params.error && (
            <p className="text-sm text-muted-foreground">
              Error code: <code className="rounded bg-muted px-2 py-1">{params.error}</code>
            </p>
          )}
          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link href="/auth/login">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Link>
            </Button>
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
