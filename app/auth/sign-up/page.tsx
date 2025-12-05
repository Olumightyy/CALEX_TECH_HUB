"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OTPInput } from "@/components/auth/otp-input"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  RefreshCw,
} from "lucide-react"

type Step = "details" | "verify"

export default function SignUpPage() {
  const [step, setStep] = useState<Step>("details")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "student",
  })
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useRouter()
  const cooldownRef = React.useRef<NodeJS.Timeout | null>(null)

  // Cleanup cooldown timer on unmount
  React.useEffect(() => {
    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current)
      }
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

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      setError("Please enter your full name")
      return false
    }
    if (!formData.email.trim()) {
      setError("Please enter your email address")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }
    return true
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!validateForm()) return

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role,
          },
        },
      })

      if (error) throw error

      setStep("verify")
      setSuccessMessage("Verification code sent to your email")
      startCooldown()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account. Please try again.")
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
        email: formData.email,
        token: otpCode,
        type: "signup",
      })

      if (error) throw error

      if (data.user) {
        setSuccessMessage("Account verified successfully! Redirecting...")

        // Redirect based on role
        setTimeout(() => {
          if (formData.role === "teacher") {
            router.push("/teacher/verification-pending")
          } else if (formData.role === "admin") {
            router.push("/admin")
          } else {
            router.push("/student")
          }
          router.refresh()
        }, 1000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0 || isLoading) return

    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: formData.email,
      })

      if (error) throw error

      setOtp(Array(6).fill(""))
      setSuccessMessage("New verification code sent!")
      startCooldown()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code")
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = () => {
    const { password } = formData
    if (!password) return null

    let score = 0
    if (password.length >= 8) score++
    if (password.length >= 12) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 1) return { label: "Weak", color: "bg-destructive", width: "w-1/4" }
    if (score <= 2) return { label: "Fair", color: "bg-orange-500", width: "w-2/4" }
    if (score <= 3) return { label: "Good", color: "bg-yellow-500", width: "w-3/4" }
    return { label: "Strong", color: "bg-green-500", width: "w-full" }
  }

  const strength = getPasswordStrength()

  // OTP Verification Screen
  if (step === "verify") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => {
              setStep("details")
              setOtp(Array(6).fill(""))
              setError(null)
              setSuccessMessage(null)
            }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sign up
          </Button>

          <Card className="border-0 shadow-2xl shadow-primary/10 sm:border">
            <CardHeader className="pb-4 text-center">
              {/* Animated Icon */}
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25 sm:h-24 sm:w-24">
                <Mail className="h-10 w-10 text-primary-foreground sm:h-12 sm:w-12" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl">Check your email</CardTitle>
              <CardDescription className="mt-2 text-base">We sent a 6-digit verification code to</CardDescription>
              <p className="mt-1 font-semibold text-foreground">{formData.email}</p>
            </CardHeader>

            <CardContent className="pt-2">
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                {/* OTP Input */}
                <div className="space-y-3">
                  <Label className="sr-only">Verification Code</Label>
                  <OTPInput value={otp} onChange={setOtp} disabled={isLoading} autoFocus />
                  <p className="text-center text-sm text-muted-foreground">Enter the 6-digit code from your email</p>
                </div>

                {/* Success Message */}
                {successMessage && (
                  <div className="flex items-center gap-2 rounded-xl bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    {successMessage}
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="rounded-xl bg-destructive/10 p-3 text-center text-sm text-destructive">{error}</div>
                )}

                {/* Verify Button */}
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
                      Verify & Continue
                    </>
                  )}
                </Button>

                {/* Resend Section */}
                <div className="space-y-2 text-center">
                  <p className="text-sm text-muted-foreground">Didn&apos;t receive the code?</p>
                  {resendCooldown > 0 ? (
                    <p className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                      <RefreshCw className="h-4 w-4" />
                      Resend available in{" "}
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {resendCooldown}
                      </span>
                    </p>
                  ) : (
                    <Button
                      type="button"
                      variant="link"
                      onClick={handleResendCode}
                      className="font-semibold text-primary"
                      disabled={isLoading}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend verification code
                    </Button>
                  )}
                </div>

                {/* Help Text */}
                <p className="text-center text-xs text-muted-foreground">
                  Check your spam folder if you don&apos;t see the email
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Sign Up Form Screen
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left Panel - Branding (Hidden on mobile) */}
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Content */}
          <div className="relative flex h-full flex-col items-center justify-center px-8 xl:px-16">
            {/* Logo */}
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-background shadow-2xl xl:h-24 xl:w-24">
              <GraduationCap className="h-10 w-10 text-primary xl:h-12 xl:w-12" />
            </div>

            <h2 className="mb-4 text-center text-3xl font-bold text-primary-foreground xl:text-4xl">
              Start Your Learning Journey
            </h2>
            <p className="mb-10 max-w-md text-center text-lg text-primary-foreground/80">
              Join thousands of learners and gain skills that matter.
            </p>

            {/* Benefits */}
            <div className="grid w-full max-w-md gap-4">
              {[
                { icon: BookOpen, text: "Access 500+ expert-led courses" },
                { icon: Award, text: "Earn recognized certificates" },
                { icon: CheckCircle, text: "Learn at your own pace" },
                { icon: ShieldCheck, text: "Quality-controlled content" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-xl bg-primary-foreground/10 p-4 backdrop-blur-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <item.icon className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <span className="font-medium text-primary-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-8 sm:px-6 lg:px-12 xl:px-16">
        <div className="mx-auto w-full max-w-sm sm:max-w-md">
          {/* Mobile Logo */}
          <Link href="/" className="mb-6 inline-flex items-center gap-2 lg:mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <GraduationCap className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">EduPlatform</span>
          </Link>

          <Card className="border-0 shadow-none sm:border sm:shadow-xl sm:shadow-primary/5">
            <CardHeader className="px-0 pb-4 sm:px-6">
              <CardTitle className="text-2xl sm:text-3xl">Create an account</CardTitle>
              <CardDescription className="text-base">Get started with your free account today</CardDescription>
            </CardHeader>

            <CardContent className="px-0 sm:px-6">
              <form onSubmit={handleSignUp} className="space-y-4 sm:space-y-5">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    disabled={isLoading}
                    className="h-11 sm:h-12"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={isLoading}
                    className="h-11 sm:h-12"
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">I want to</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="h-11 sm:h-12">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Learn (Student)</SelectItem>
                      <SelectItem value="teacher">Teach (Instructor)</SelectItem>
                    </SelectContent>
                  </Select>
                  {formData.role === "teacher" && (
                    <p className="text-xs text-muted-foreground">
                      Teachers require verification before publishing courses.
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 8 characters"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  {strength && (
                    <div className="space-y-1">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                      </div>
                      <p className="text-xs text-muted-foreground">Password strength: {strength.label}</p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Repeat your password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    disabled={isLoading}
                    className="h-11 sm:h-12"
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>

                {/* Error Message */}
                {error && <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="h-11 w-full text-base font-semibold shadow-lg shadow-primary/25 sm:h-12"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                {/* Terms */}
                <p className="text-center text-xs text-muted-foreground">
                  By creating an account, you agree to our{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </p>

                {/* Login Link */}
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="font-semibold text-primary hover:underline">
                    Sign in
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Add useState import at the top level
import { useState } from "react"
