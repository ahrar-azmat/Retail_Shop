import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { SaleForm } from "@/components/sales/sale-form"

export default async function NewSalePage() {
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

  if (!profile || profile.role !== "owner") {
    redirect("/auth/login")
  }

  // Get inventory items for the sale form
  const { data: inventoryItems } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("owner_id", user.id)
    .gt("quantity_in_stock", 0)
    .order("name")

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
                <h1 className="text-xl font-bold text-foreground">Record New Sale</h1>
                <p className="text-sm text-muted-foreground">Add a new sales transaction</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <SaleForm inventoryItems={inventoryItems || []} />
        </div>
      </div>
    </div>
  )
}
