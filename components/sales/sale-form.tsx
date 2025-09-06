"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Package } from "lucide-react"
import Link from "next/link"

interface InventoryItem {
  id: string
  name: string
  selling_price: number
  quantity_in_stock: number
  image_url?: string
}

interface SaleFormProps {
  inventoryItems: InventoryItem[]
}

export function SaleForm({ inventoryItems }: SaleFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    item_id: "",
    quantity: "",
    unit_price: "",
    customer_name: "",
    customer_phone: "",
    notes: "",
  })

  const selectedItem = inventoryItems.find((item) => item.id === formData.item_id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const quantity = Number.parseInt(formData.quantity)
      const unitPrice = Number.parseFloat(formData.unit_price)
      const totalAmount = quantity * unitPrice

      // Check if enough stock is available
      if (selectedItem && quantity > selectedItem.quantity_in_stock) {
        throw new Error(`Only ${selectedItem.quantity_in_stock} items available in stock`)
      }

      // Record the sale transaction
      const { error: transactionError } = await supabase.from("transactions").insert({
        transaction_type: "sale",
        item_id: formData.item_id,
        quantity: quantity,
        unit_price: unitPrice,
        total_amount: totalAmount,
        customer_name: formData.customer_name || null,
        customer_phone: formData.customer_phone || null,
        notes: formData.notes || null,
        owner_id: user.id,
      })

      if (transactionError) throw transactionError

      // Update inventory stock
      const { error: inventoryError } = await supabase
        .from("inventory_items")
        .update({
          quantity_in_stock: selectedItem!.quantity_in_stock - quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", formData.item_id)

      if (inventoryError) throw inventoryError

      router.push("/reports")
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }

      // Auto-fill unit price when item is selected
      if (field === "item_id") {
        const item = inventoryItems.find((i) => i.id === value)
        if (item) {
          updated.unit_price = item.selling_price.toString()
        }
      }

      return updated
    })
  }

  const totalAmount =
    formData.quantity && formData.unit_price
      ? (Number.parseInt(formData.quantity) * Number.parseFloat(formData.unit_price)).toFixed(2)
      : "0.00"

  if (inventoryItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            No Items Available
          </CardTitle>
          <CardDescription>You need to add inventory items before recording sales.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No items in stock to sell</p>
            <Link href="/inventory/add">
              <Button>Add Your First Item</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Sale Details
        </CardTitle>
        <CardDescription>Record a new sales transaction and update inventory.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="item_id">Product *</Label>
              <Select value={formData.item_id} onValueChange={(value) => handleInputChange("item_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product to sell" />
                </SelectTrigger>
                <SelectContent>
                  {inventoryItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center gap-2">
                        {item.image_url && (
                          <img
                            src={item.image_url || "/placeholder.svg"}
                            alt={item.name}
                            className="h-6 w-6 rounded object-cover"
                          />
                        )}
                        <span>{item.name}</span>
                        <span className="text-muted-foreground">
                          (${item.selling_price} - {item.quantity_in_stock} in stock)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedItem && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  {selectedItem.image_url && (
                    <img
                      src={selectedItem.image_url || "/placeholder.svg"}
                      alt={selectedItem.name}
                      className="h-12 w-12 rounded object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium">{selectedItem.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Price: ${selectedItem.selling_price} | Stock: {selectedItem.quantity_in_stock}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedItem?.quantity_in_stock || 1}
                  placeholder="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_price">Unit Price *</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.unit_price}
                  onChange={(e) => handleInputChange("unit_price", e.target.value)}
                  required
                />
              </div>
            </div>

            {formData.quantity && formData.unit_price && (
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="text-lg font-semibold">Total Amount: ${totalAmount}</div>
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Customer Information (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  placeholder="John Doe"
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange("customer_name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_phone">Phone Number</Label>
                <Input
                  id="customer_phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.customer_phone}
                  onChange={(e) => handleInputChange("customer_phone", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes about this sale..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading || !formData.item_id} className="flex-1">
              {isLoading ? "Recording Sale..." : "Record Sale"}
            </Button>
            <Link href="/dashboard">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
