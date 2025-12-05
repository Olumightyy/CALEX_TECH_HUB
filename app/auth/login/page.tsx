"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OTPInput } from "@/components/auth/otp-input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  GraduationCap,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  Mail,
  ArrowLeft,
  ShieldCheck,
  BookOpen,
  Award,
  Users,
  RefreshCw,
  KeyRound,
} from "lucide-react"

type LoginMethod = "password" | "otp"
type OTPStep = "email" | "verify"

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password")
  const [otpStep, setOtpStep] = useState<OTPStep>("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useRouter()
  const cooldownRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current)
    }
  }, [])

  const startCooldown = () => {
    setResendCooldown(60)
    if (cooldownRef.current) clearInterval(cooldownRef.current)

    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

        const redirectPath =
          profile?.role === "admin" ? "/admin" : profile?.role === "teacher" ? "/teacher" : "/student"

        router.push(redirectPath)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false, // Only allow existing users
        },
      })

      if (error) throw error

      setOtpStep("verify")
      setSuccessMessage("Verification code sent to your email")
      startCooldown()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code. Make sure you have an account.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const otpCode = otp.join("")
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "email",
      })

      if (error) throw error

      if (data.user) {
        setSuccessMessage("Verified! Redirecting...")

        const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

        setTimeout(() => {
          const redirectPath =
            profile?.role === "admin" ? "/admin" : profile?.role === "teacher" ? "/teacher" : "/student"
          router.push(redirectPath)
          router.refresh()
        }, 1000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || isLoading) return

    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      })

      if (error) throw error

      setOtp(Array(6).fill(""))
      setSuccessMessage("New code sent!")
      startCooldown()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code")
    } finally {
      setIsLoading(false)
    }
  }

  const benefits = [
    { icon: BookOpen, text: "Access 500+ quality courses" },
    { icon: Award, text: "Earn recognized certificates" },
    { icon: Users, text: "Learn from expert instructors" },
    { icon: CheckCircle, text: "Track your progress" },
  ]

  // OTP Verification Screen
  if (loginMethod === "otp" && otpStep === "verify") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => {
              setOtpStep("email")
              setOtp(Array(6).fill(""))
              setError(null)
              setSuccessMessage(null)
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Card className="border-0 shadow-2xl shadow-primary/10 sm:border">
            <CardHeader className="pb-4 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 sm:h-24 sm:w-24">
                <Mail className="h-10 w-10 text-primary-foreground sm:h-12 sm:w-12" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl">Enter verification code</CardTitle>
              <CardDescription className="mt-2 text-base">
                We sent a code to <span className="font-semibold text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-2">
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <OTPInput value={otp} onChange={setOtp} disabled={isLoading} autoFocus />

                {successMessage && (
                  <div className="flex items-center gap-2 rounded-xl bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    {successMessage}
                  </div>
                )}

                {error && (
                  <div className="rounded-xl bg-destructive/10 p-3 text-center text-sm text-destructive">{error}</div>
                )}

                <Button
                  type="submit"
                  className="h-12 w-full text-base font-semibold shadow-lg shadow-primary/25"
                  disabled={isLoading || otp.join("").length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="mr-2 h-5 w-5" />
                      Verify & Sign In
                    </>
                  )}
                </Button>

                <div className="space-y-2 text-center">
                  <p className="text-sm text-muted-foreground">Didn&apos;t receive the code?</p>
                  {resendCooldown > 0 ? (
                    <p className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                      <RefreshCw className="h-4 w-4" />
                      Resend in{" "}
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {resendCooldown}
                      </span>
                    </p>
                  ) : (
                    <Button
                      type="button"
                      variant="link"
                      onClick={handleResendOTP}
                      disabled={isLoading}
                      className="font-semibold text-primary"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend code
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Main Login Screen
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left Panel - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-sm sm:max-w-md">
          {/* Logo */}
          <Link href="/" className="mb-6 inline-flex items-center gap-2 lg:mb-8">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary sm:h-11 sm:w-11">
              <GraduationCap className="h-5 w-5 text-primary-foreground sm:h-6 sm:w-6" />
              <div className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-accent sm:h-3 sm:w-3" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight">EduPlatform</span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Learn Without Limits
              </span>
            </div>
          </Link>

          <Card className="border-0 shadow-none sm:border sm:shadow-xl sm:shadow-primary/5">
            <CardHeader className="px-0 pb-4 sm:px-6">
              <CardTitle className="text-2xl font-bold sm:text-3xl">Welcome back</CardTitle>
              <CardDescription className="text-base">Sign in to continue your learning journey</CardDescription>
            </CardHeader>

            <CardContent className="px-0 sm:px-6">
              {/* Login Method Tabs */}
              <div className="mb-6 flex rounded-xl bg-muted p-1">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("password")
                    setError(null)
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    loginMethod === "password"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <KeyRound className="h-4 w-4" />
                  <span className="hidden sm:inline">Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod("otp")
                    setOtpStep("email")
                    setError(null)
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    loginMethod === "otp"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  <span className="hidden sm:inline">Email Code</span>
                </button>
              </div>

              {/* Password Login Form */}
              {loginMethod === "password" && (
                <form onSubmit={handlePasswordLogin} className="space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="h-11 sm:h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-xs font-medium text-primary hover:underline sm:text-sm"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="h-11 pr-10 sm:h-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {error && <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

                  <Button
                    type="submit"
                    className="h-11 w-full text-base font-semibold shadow-lg shadow-primary/25 sm:h-12"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              )}

              {/* OTP Email Form */}
              {loginMethod === "otp" && otpStep === "email" && (
                <form onSubmit={handleSendOTP} className="space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="otp-email">Email address</Label>
                    <Input
                      id="otp-email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="h-11 sm:h-12"
                    />
                    <p className="text-xs text-muted-foreground">
                      We&apos;ll send a 6-digit verification code to your email
                    </p>
                  </div>

                  {error && <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

                  <Button
                    type="submit"
                    className="h-11 w-full text-base font-semibold shadow-lg shadow-primary/25 sm:h-12"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending code...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Code
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Sign Up Link */}
              <div className="mt-6 text-center sm:mt-8">
                <p className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/sign-up" className="font-semibold text-primary hover:underline">
                    Create account
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Panel - Branding (Hidden on mobile) */}
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent)]" />

          <div className="relative flex h-full flex-col items-center justify-center px-8 xl:px-12">
            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent shadow-xl xl:h-20 xl:w-20">
              <GraduationCap className="h-8 w-8 text-accent-foreground xl:h-10 xl:w-10" />
            </div>

            <h2 className="mb-4 text-center text-2xl font-bold text-primary-foreground xl:text-3xl">
              Continue Your Learning Journey
            </h2>
            <p className="mb-10 max-w-md text-center text-base text-primary-foreground/70 xl:mb-12 xl:text-lg">
              Access thousands of courses from verified experts.
            </p>

            <div className="grid w-full max-w-md gap-3 xl:gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl bg-primary-foreground/10 p-3 backdrop-blur-sm xl:gap-4 xl:p-4"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent xl:h-10 xl:w-10">
                    <benefit.icon className="h-4 w-4 text-accent-foreground xl:h-5 xl:w-5" />
                  </div>
                  <span className="text-sm font-medium text-primary-foreground xl:text-base">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
