import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { ClientInventoryTable } from "@/components/client/client-inventory-table"
import { ClientInventoryFilters } from "@/components/client/client-inventory-filters"

export default async function ClientInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; filter?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

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

  if (!profile || profile.role !== "client") {
    redirect("/dashboard")
  }

  // Build query for inventory items (clients can see all inventory but no pricing)
  let query = supabase.from("inventory_items").select(`
      id,
      name,
      description,
      sku,
      quantity_in_stock,
      min_stock_level,
      image_url,
      categories(name)
    `)

  // Apply search filter
  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%,sku.ilike.%${params.search}%`)
  }

  // Apply category filter
  if (params.category) {
    query = query.eq("category_id", params.category)
  }

  // Apply stock filter
  if (params.filter === "low-stock") {
    query = query.lte("quantity_in_stock", supabase.rpc("min_stock_level"))
  } else if (params.filter === "out-of-stock") {
    query = query.eq("quantity_in_stock", 0)
  }

  const { data: inventoryItems } = await query.order("name")

  // Get categories for filter dropdown
  const { data: categories } = await supabase.from("categories").select("*").order("name")

  // Get summary stats
  const totalItems = inventoryItems?.length || 0
  const lowStockItems = inventoryItems?.filter((item) => item.quantity_in_stock <= item.min_stock_level).length || 0
  const outOfStockItems = inventoryItems?.filter((item) => item.quantity_in_stock === 0).length || 0

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/client/dashboard">
                <Button variant="ghost" size="sm">
                  ← Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">Inventory Browser</h1>
                <p className="text-sm text-muted-foreground">View current stock levels</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
              <p className="text-xs text-muted-foreground">Items in inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockItems}</div>
              <p className="text-xs text-muted-foreground">Items need restocking</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{outOfStockItems}</div>
              <p className="text-xs text-muted-foreground">Items unavailable</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <ClientInventoryFilters categories={categories || []} />

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientInventoryTable items={inventoryItems || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
