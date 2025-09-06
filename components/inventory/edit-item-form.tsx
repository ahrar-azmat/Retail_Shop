"use client"

import Link from "next/link"
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
import { Package } from "lucide-react"
import { PhotoUpload } from "./photo-upload"

interface Category {
  id: string
  name: string
}

interface InventoryItem {
  id: string
  name: string
  description: string | null
  sku: string | null
  category_id: string | null
  cost_price: number
  selling_price: number
  quantity_in_stock: number
  min_stock_level: number
  barcode: string | null
  image_url: string | null
  categories: { id: string; name: string } | null
}

interface EditItemFormProps {
  item: InventoryItem
  categories: Category[]
}

export function EditItemForm({ item, categories }: EditItemFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: item.name,
    description: item.description || "",
    sku: item.sku || "",
    category_id: item.category_id || "",
    cost_price: item.cost_price.toString(),
    selling_price: item.selling_price.toString(),
    quantity_in_stock: item.quantity_in_stock.toString(),
    min_stock_level: item.min_stock_level.toString(),
    barcode: item.barcode || "",
    image_url: item.image_url || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("inventory_items")
        .update({
          name: formData.name,
          description: formData.description || null,
          sku: formData.sku || null,
          category_id: formData.category_id || null,
          cost_price: Number.parseFloat(formData.cost_price),
          selling_price: Number.parseFloat(formData.selling_price),
          quantity_in_stock: Number.parseInt(formData.quantity_in_stock),
          min_stock_level: Number.parseInt(formData.min_stock_level),
          barcode: formData.barcode || null,
          image_url: formData.image_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", item.id)

      if (error) throw error

      router.push("/inventory")
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePhotoUploaded = (url: string) => {
    setFormData((prev) => ({ ...prev, image_url: url }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Edit Item Details
        </CardTitle>
        <CardDescription>Update the details for your inventory item and change the photo if needed.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <PhotoUpload onPhotoUploaded={handlePhotoUploaded} currentPhoto={formData.image_url} />

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., iPhone 15 Pro"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  placeholder="e.g., IPH15P-128-BLK"
                  value={formData.sku}
                  onChange={(e) => handleInputChange("sku", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the item..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category_id} onValueChange={(value) => handleInputChange("category_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  placeholder="e.g., 123456789012"
                  value={formData.barcode}
                  onChange={(e) => handleInputChange("barcode", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost_price">Cost Price *</Label>
                <Input
                  id="cost_price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.cost_price}
                  onChange={(e) => handleInputChange("cost_price", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="selling_price">Selling Price *</Label>
                <Input
                  id="selling_price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.selling_price}
                  onChange={(e) => handleInputChange("selling_price", e.target.value)}
                  required
                />
              </div>
            </div>
            {formData.cost_price && formData.selling_price && (
              <div className="text-sm text-muted-foreground">
                Profit Margin: $
                {(Number.parseFloat(formData.selling_price) - Number.parseFloat(formData.cost_price)).toFixed(2)} (
                {(
                  ((Number.parseFloat(formData.selling_price) - Number.parseFloat(formData.cost_price)) /
                    Number.parseFloat(formData.selling_price)) *
                  100
                ).toFixed(1)}
                %)
              </div>
            )}
          </div>

          {/* Stock */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Stock Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity_in_stock">Current Stock *</Label>
                <Input
                  id="quantity_in_stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.quantity_in_stock}
                  onChange={(e) => handleInputChange("quantity_in_stock", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min_stock_level">Minimum Stock Level *</Label>
                <Input
                  id="min_stock_level"
                  type="number"
                  min="0"
                  placeholder="5"
                  value={formData.min_stock_level}
                  onChange={(e) => handleInputChange("min_stock_level", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Updating Item..." : "Update Item"}
            </Button>
            <Link href="/inventory">
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
