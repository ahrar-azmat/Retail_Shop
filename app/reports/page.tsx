import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, DollarSign, Package, Calendar, Download } from "lucide-react"
import Link from "next/link"
import { ProfitLossChart } from "@/components/reports/profit-loss-chart"
import { SalesChart } from "@/components/reports/sales-chart"
import { TopProductsTable } from "@/components/reports/top-products-table"
import { RecentTransactions } from "@/components/reports/recent-transactions"

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const period = params.period || "month"

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

  if (!profile || profile.role !== "owner") {
    redirect("/auth/login")
  }

  // Calculate date ranges based on period
  const now = new Date()
  let startDate: Date
  const endDate = now

  switch (period) {
    case "week":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
      break
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    case "quarter":
      const quarterStart = Math.floor(now.getMonth() / 3) * 3
      startDate = new Date(now.getFullYear(), quarterStart, 1)
      break
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1)
      break
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  // Get P&L summary for the period
  const { data: plSummary } = await supabase
    .from("profit_loss_summary")
    .select("*")
    .eq("owner_id", user.id)
    .gte("month", startDate.toISOString().slice(0, 7) + "-01")
    .lte("month", endDate.toISOString().slice(0, 7) + "-01")

  // Calculate totals
  const totalRevenue = plSummary?.reduce((sum, item) => sum + (item.total_revenue || 0), 0) || 0
  const totalCost = plSummary?.reduce((sum, item) => sum + (item.total_cost || 0), 0) || 0
  const grossProfit = totalRevenue - totalCost
  const totalSales = plSummary?.reduce((sum, item) => sum + (item.total_sales || 0), 0) || 0
  const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : "0.0"

  // Get recent transactions
  const { data: recentTransactions } = await supabase
    .from("transactions")
    .select(`
      *,
      inventory_items(name, image_url)
    `)
    .eq("owner_id", user.id)
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: false })
    .limit(10)

  // Get top selling products
  const { data: topProducts } = await supabase
    .from("transactions")
    .select(`
      item_id,
      inventory_items(name, selling_price, image_url),
      quantity,
      total_amount
    `)
    .eq("owner_id", user.id)
    .eq("transaction_type", "sale")
    .gte("created_at", startDate.toISOString())

  // Process top products data
  const productSales = topProducts?.reduce((acc: any, transaction) => {
    const itemId = transaction.item_id
    if (!acc[itemId]) {
      acc[itemId] = {
        id: itemId,
        name: transaction.inventory_items?.name || "Unknown",
        image_url: transaction.inventory_items?.image_url,
        totalQuantity: 0,
        totalRevenue: 0,
        salesCount: 0,
      }
    }
    acc[itemId].totalQuantity += transaction.quantity
    acc[itemId].totalRevenue += transaction.total_amount
    acc[itemId].salesCount += 1
    return acc
  }, {})

  const topProductsList = Object.values(productSales || {})
    .sort((a: any, b: any) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  ← Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">Reports & Analytics</h1>
                <p className="text-sm text-muted-foreground">{profile.shop_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/sales/new">
                <Button>
                  <Package className="h-4 w-4 mr-2" />
                  Record Sale
                </Button>
              </Link>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Period Selector */}
        <div className="flex items-center gap-4 mb-8">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <div className="flex gap-2">
            {[
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
              { value: "quarter", label: "This Quarter" },
              { value: "year", label: "This Year" },
            ].map((p) => (
              <Link key={p.value} href={`/reports?period=${p.value}`}>
                <Button variant={period === p.value ? "default" : "outline"} size="sm">
                  {p.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {period === "week"
                  ? "This week"
                  : period === "month"
                    ? "This month"
                    : period === "quarter"
                      ? "This quarter"
                      : "This year"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Cost of goods sold</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${grossProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${grossProfit.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">Margin: {profitMargin}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSales}</div>
              <p className="text-xs text-muted-foreground">Transactions completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
            <TabsTrigger value="products">Top Products</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProfitLossChart data={plSummary || []} />
              <SalesChart data={plSummary || []} />
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <SalesChart data={plSummary || []} />
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <TopProductsTable products={topProductsList} />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <RecentTransactions transactions={recentTransactions || []} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
