import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, TrendingUp, DollarSign, AlertTriangle, Plus, BarChart3, Camera, Store } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile and check role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  if (profile.role === "client") {
    redirect("/client/dashboard")
  }

  if (profile.role !== "owner") {
    redirect("/auth/login")
  }

  // Get dashboard metrics
  const { data: inventoryCount } = await supabase
    .from("inventory_items")
    .select("id", { count: "exact" })
    .eq("owner_id", user.id)

  const { data: lowStockItems } = await supabase.from("low_stock_items").select("*").eq("owner_id", user.id).limit(5)

  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select(`
      *,
      inventory_items(name)
    `)
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Calculate monthly metrics
  const currentMonth = new Date().toISOString().slice(0, 7)
  const { data: monthlyMetrics } = await supabase
    .from("profit_loss_summary")
    .select("*")
    .eq("owner_id", user.id)
    .gte("month", currentMonth + "-01")
    .single()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">RetailPro</h1>
                  <p className="text-sm text-muted-foreground">{profile.shop_name || "Dashboard"}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Welcome, {profile.full_name}</span>
              <form action="/auth/signout" method="post">
                <Button variant="ghost" size="sm">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}!
          </h2>
          <p className="text-muted-foreground">Here's what's happening with your business today.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryCount?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Items in inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${monthlyMetrics?.total_revenue?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">This month's sales</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${monthlyMetrics?.gross_profit?.toFixed(2) || "0.00"}</div>
              <p className="text-xs text-muted-foreground">This month's profit</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockItems?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Items need restocking</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/inventory/add">
            <Button className="w-full h-20 flex flex-col gap-2">
              <Camera className="h-6 w-6" />
              Add New Item
            </Button>
          </Link>

          <Link href="/inventory">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent">
              <Package className="h-6 w-6" />
              View Inventory
            </Button>
          </Link>

          <Link href="/reports">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent">
              <BarChart3 className="h-6 w-6" />
              View Reports
            </Button>
          </Link>

          <Link href="/sales/new">
            <Button variant="outline" className="w-full h-20 flex flex-col gap-2 bg-transparent">
              <Plus className="h-6 w-6" />
              Record Sale
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>Items that need immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockItems && lowStockItems.length > 0 ? (
                <div className="space-y-3">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Stock: {item.quantity_in_stock} | Min: {item.min_stock_level}
                        </p>
                      </div>
                      <Badge variant="destructive">Low Stock</Badge>
                    </div>
                  ))}
                  <Link href="/inventory?filter=low-stock">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      View All Low Stock Items
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">All items are well stocked!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest transactions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTransactions && recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">
                          {transaction.transaction_type === "sale" ? "Sale" : "Purchase"}:{" "}
                          {transaction.inventory_items?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Qty: {transaction.quantity} | ${transaction.total_amount}
                        </p>
                      </div>
                      <Badge variant={transaction.transaction_type === "sale" ? "default" : "secondary"}>
                        {transaction.transaction_type}
                      </Badge>
                    </div>
                  ))}
                  <Link href="/transactions">
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      View All Transactions
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent activity</p>
                  <Link href="/sales/new">
                    <Button size="sm" className="mt-2">
                      Record Your First Sale
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Business Insights */}
        {monthlyMetrics && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>This Month's Performance</CardTitle>
              <CardDescription>
                Key metrics for {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${monthlyMetrics.total_revenue?.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">${monthlyMetrics.total_cost?.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">Total Costs</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{monthlyMetrics.total_sales}</div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
