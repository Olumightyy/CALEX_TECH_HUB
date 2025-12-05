"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Shield, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Get user profile to determine redirect
      if (data.user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

        // Redirect based on role
        if (profile?.role === "admin") {
          router.push("/admin")
        } else if (profile?.role === "teacher") {
          router.push("/teacher")
        } else {
          router.push("/student")
        }
        router.refresh()
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
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
              <CardTitle className="text-2xl text-slate-900">Welcome back</CardTitle>
              <CardDescription className="text-slate-600">Sign in to your account to continue learning</CardDescription>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="border-slate-300 focus:border-amber-500 focus:ring-amber-500"
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="/auth/forgot-password" className="text-sm text-slate-900 hover:text-amber-600 font-medium hover:underline">
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
                        className="pr-10 border-slate-300 focus:border-amber-500 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">{error}</div>}
                  <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-md" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <span className="flex items-center">
                         Sign In <ArrowRight className="ml-2 h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </div>
                <div className="mt-6 text-center text-sm text-slate-600">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/sign-up" className="font-bold text-slate-900 hover:text-amber-600 hover:underline">
                    Create account
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Image/Branding */}
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-slate-900">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-950 opacity-90" />
          <div className="absolute inset-0 bg-[url('/abstract-geometric-pattern.png')] opacity-10" />
          <div className="flex h-full flex-col items-center justify-center px-12 text-center relative z-10">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500 text-slate-900 shadow-xl shadow-amber-500/20">
              <Shield className="h-10 w-10" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-white">Continue Your Learning Journey</h2>
            <p className="max-w-md text-lg text-slate-300">
              Access thousands of courses from verified experts. Track your progress and earn recognized certificates.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
