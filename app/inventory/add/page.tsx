import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AddItemForm } from "@/components/inventory/add-item-form"

export default async function AddInventoryPage() {
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

  // Get categories for the form
  const { data: categories } = await supabase.from("categories").select("*").eq("owner_id", user.id).order("name")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/inventory">
                <Button variant="ghost" size="sm">
                  ← Back to Inventory
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-foreground">Add New Item</h1>
                <p className="text-sm text-muted-foreground">Add a new product to your inventory</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <AddItemForm categories={categories || []} />
        </div>
      </div>
    </div>
  )
}
