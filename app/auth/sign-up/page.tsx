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
import { Shield, Eye, EyeOff, Loader2, CheckCircle, ArrowRight } from "lucide-react"

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
    if (password.length < 6) return { label: "Weak", color: "bg-red-500", width: "w-1/4" }
    if (password.length < 8) return { label: "Fair", color: "bg-amber-500", width: "w-2/4" }
    if (password.length < 12) return { label: "Good", color: "bg-yellow-500", width: "w-3/4" }
    return { label: "Strong", color: "bg-emerald-500", width: "w-full" }
  }

  const strength = passwordStrength()

  return (
    <div className="flex min-h-screen">
      {/* Left side - Image/Branding */}
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-950 opacity-90" />
          <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-10" />
          <div className="flex h-full flex-col items-center justify-center px-12 text-center relative z-10">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500 text-slate-900 shadow-xl shadow-amber-500/20">
              <Shield className="h-10 w-10" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-white">Start Your Learning Journey</h2>
            <p className="mb-8 max-w-md text-lg text-slate-300">
              Join thousands of students and learn from verified industry experts.
            </p>
            <div className="space-y-4 text-left">
              {[
                "Access to quality-controlled courses",
                "Learn from verified experts",
                "Earn recognized certificates",
                "Track your learning progress"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-slate-300">
                  <CheckCircle className="h-5 w-5 text-amber-500" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Shield className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-slate-900">CalexHub</span>
            </Link>
          </div>

          <Card className="border-0 shadow-none sm:border-slate-200 sm:shadow-sm">
            <CardHeader className="px-0 sm:px-6">
              <CardTitle className="text-2xl text-slate-900">Create an account</CardTitle>
              <CardDescription className="text-slate-600">Get started with your free account today</CardDescription>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="fullName" className="text-slate-700">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      disabled={isLoading}
                      className="border-slate-300 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-slate-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={isLoading}
                      className="border-slate-300 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role" className="text-slate-700">I want to</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                      disabled={isLoading}
                    >
                      <SelectTrigger className="border-slate-300 focus:ring-amber-500">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Learn (Student)</SelectItem>
                        <SelectItem value="teacher">Teach (Instructor)</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.role === "teacher" && (
                      <p className="text-xs text-slate-500">
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
                        className="pr-10 border-slate-300 focus:border-amber-500 focus:ring-amber-500"
                        placeholder="At least 8 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {strength && (
                      <div className="space-y-1">
                        <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full transition-all ${strength.color} ${strength.width}`} />
                        </div>
                        <p className="text-xs text-slate-500">Password strength: {strength.label}</p>
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
                      className="border-slate-300 focus:border-amber-500 focus:ring-amber-500"
                    />
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-red-600">Passwords do not match</p>
                    )}
                  </div>
                  {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</div>}
                  <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-md" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <span className="flex items-center">
                        Create Account <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                  <p className="text-center text-xs text-slate-500">
                    By creating an account, you agree to our{" "}
                    <Link href="/terms" className="text-slate-900 hover:text-amber-600 hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-slate-900 hover:text-amber-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
                <div className="mt-6 text-center text-sm text-slate-600">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="font-bold text-slate-900 hover:text-amber-600 hover:underline">
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
