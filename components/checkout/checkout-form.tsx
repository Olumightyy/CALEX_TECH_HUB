"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { createClient } from "@/lib/supabase/client"
import { Loader2, CreditCard, Building2 } from "lucide-react"
import type { Course } from "@/lib/types/database"

interface CheckoutFormProps {
  course: Course
  userId: string
}

export function CheckoutForm({ course, userId }: CheckoutFormProps) {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Create payment record
      const paymentRef = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      const { error: paymentError } = await supabase.from("payments").insert({
        student_id: userId,
        course_id: course.id,
        amount: course.price,
        currency: "NGN",
        status: "completed", // In production, this would be 'pending' until payment gateway confirms
        payment_method: paymentMethod,
        payment_reference: paymentRef,
        gateway: "mock", // Would be 'paystack' or 'flutterwave' in production
      })

      if (paymentError) throw paymentError

      // Create enrollment
      const { error: enrollmentError } = await supabase.from("enrollments").insert({
        student_id: userId,
        course_id: course.id,
        status: "active",
      })

      if (enrollmentError) throw enrollmentError

      // Update course enrollment count
      await supabase
        .from("courses")
        .update({ enrollment_count: course.enrollment_count + 1 })
        .eq("id", course.id)

      // Redirect to course
      router.push(`/student/courses/${course.slug}?enrolled=true`)
      router.refresh()
    } catch (err) {
      console.error("Checkout error:", err)
      setError("Payment failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label className="text-base font-semibold">Payment Method</Label>
        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-4 grid gap-4">
          <label
            className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${
              paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <RadioGroupItem value="card" id="card" />
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">Credit/Debit Card</p>
              <p className="text-sm text-muted-foreground">Pay with Visa, Mastercard, or Verve</p>
            </div>
          </label>
          <label
            className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${
              paymentMethod === "bank" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <RadioGroupItem value="bank" id="bank" />
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium">Bank Transfer</p>
              <p className="text-sm text-muted-foreground">Pay directly from your bank account</p>
            </div>
          </label>
        </RadioGroup>
      </div>

      {paymentMethod === "card" && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-4">
          <div className="grid gap-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input id="cardNumber" placeholder="4242 4242 4242 4242" disabled={loading} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input id="expiry" placeholder="MM/YY" disabled={loading} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input id="cvv" placeholder="123" disabled={loading} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">This is a demo. No actual payment will be processed.</p>
        </div>
      )}

      {paymentMethod === "bank" && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-4 text-sm text-muted-foreground">You&apos;ll be redirected to complete the bank transfer.</p>
          <p className="text-xs text-muted-foreground">This is a demo. No actual payment will be processed.</p>
        </div>
      )}

      {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ₦${course.price.toLocaleString()}`
        )}
      </Button>
    </form>
  )
}
