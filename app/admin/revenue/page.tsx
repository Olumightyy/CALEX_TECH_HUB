import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, CreditCard, Calendar, ArrowUpRight } from "lucide-react"

export default async function AdminRevenuePage() {
  const supabase = await createClient()

  // Fetch all payments
  const { data: payments } = await supabase
    .from("payments")
    .select(`
      *,
      profiles(full_name, email),
      courses(title)
    `)
    .order("created_at", { ascending: false })

  const completedPayments = payments?.filter((p) => p.status === "completed") || []
  const totalRevenue = completedPayments.reduce((acc, p) => acc + (p.amount || 0), 0)

  // Calculate monthly revenue
  const now = new Date()
  const thisMonth = completedPayments.filter((p) => {
    const date = new Date(p.created_at)
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  })
  const monthlyRevenue = thisMonth.reduce((acc, p) => acc + (p.amount || 0), 0)

  // Calculate average order value
  const avgOrderValue = completedPayments.length ? totalRevenue / completedPayments.length : 0

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "All time earnings",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "This Month",
      value: `$${monthlyRevenue.toLocaleString()}`,
      icon: Calendar,
      description: `${thisMonth.length} transactions`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Transactions",
      value: completedPayments.length,
      icon: CreditCard,
      description: "Completed payments",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Avg. Order Value",
      value: `$${avgOrderValue.toFixed(2)}`,
      icon: TrendingUp,
      description: "Per transaction",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Revenue Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track all platform earnings and transactions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transactions Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>All payment activities on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {payments && payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        payment.status === "completed"
                          ? "bg-emerald-50"
                          : payment.status === "pending"
                            ? "bg-amber-50"
                            : "bg-red-50"
                      }`}
                    >
                      <DollarSign
                        className={`h-5 w-5 ${
                          payment.status === "completed"
                            ? "text-emerald-600"
                            : payment.status === "pending"
                              ? "text-amber-600"
                              : "text-red-600"
                        }`}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">{payment.profiles?.full_name || "Student"}</h4>
                      <p className="text-sm text-muted-foreground">
                        {payment.courses?.title || "Course"} · {payment.profiles?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          payment.status === "completed" ? "text-emerald-600" : "text-foreground"
                        }`}
                      >
                        ${payment.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      className={
                        payment.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : payment.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No transactions yet</h3>
              <p className="mt-2 text-muted-foreground">Payments will appear here once students enroll</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
