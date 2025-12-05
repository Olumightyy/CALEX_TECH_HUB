"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { GraduationCap, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react"

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "student",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
          data: {
            full_name: formData.fullName,
            role: formData.role,
          },
        },
      })

      if (error) throw error
      router.push("/auth/sign-up-success")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred during sign up")
    } finally {
      setIsLoading(false)
    }
  }

  const passwordStrength = () => {
    const password = formData.password
    if (password.length === 0) return null
    if (password.length < 6) return { label: "Weak", color: "bg-destructive", width: "w-1/4" }
    if (password.length < 8) return { label: "Fair", color: "bg-orange-500", width: "w-2/4" }
    if (password.length < 12) return { label: "Good", color: "bg-yellow-500", width: "w-3/4" }
    return { label: "Strong", color: "bg-green-500", width: "w-full" }
  }

  const strength = passwordStrength()

  return (
    <div className="flex min-h-screen">
      {/* Left side - Image/Branding */}
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
          <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-10" />
          <div className="flex h-full flex-col items-center justify-center px-12 text-center">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gold-500 text-navy-900">
              <GraduationCap className="h-10 w-10" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-white">Start Your Learning Journey</h2>
            <p className="mb-8 max-w-md text-lg text-navy-200">
              Join thousands of students and learn from verified industry experts.
            </p>
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3 text-navy-100">
                <CheckCircle className="h-5 w-5 text-gold-400" />
                <span>Access to quality-controlled courses</span>
              </div>
              <div className="flex items-center gap-3 text-navy-100">
                <CheckCircle className="h-5 w-5 text-gold-400" />
                <span>Learn from verified experts</span>
              </div>
              <div className="flex items-center gap-3 text-navy-100">
                <CheckCircle className="h-5 w-5 text-gold-400" />
                <span>Earn recognized certificates</span>
              </div>
              <div className="flex items-center gap-3 text-navy-100">
                <CheckCircle className="h-5 w-5 text-gold-400" />
                <span>Track your learning progress</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">EduPlatform</span>
            </Link>
          </div>

          <Card className="border-0 shadow-none sm:border sm:shadow-sm">
            <CardHeader className="px-0 sm:px-6">
              <CardTitle className="text-2xl">Create an account</CardTitle>
              <CardDescription>Get started with your free account today</CardDescription>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">I want to</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
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
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        disabled={isLoading}
                        className="pr-10"
                        placeholder="At least 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {strength && (
                      <div className="space-y-1">
                        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                          <div className={`h-full transition-all ${strength.color} ${strength.width}`} />
                        </div>
                        <p className="text-xs text-muted-foreground">Password strength: {strength.label}</p>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      disabled={isLoading}
                      placeholder="Repeat your password"
                    />
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-destructive">Passwords do not match</p>
                    )}
                  </div>
                  {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    By creating an account, you agree to our{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
                <div className="mt-6 text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="font-medium text-primary hover:underline">
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
