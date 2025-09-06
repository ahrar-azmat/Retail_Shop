"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Package } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { DeleteItemDialog } from "./delete-item-dialog"

interface InventoryItem {
  id: string
  name: string
  description: string | null
  sku: string | null
  cost_price: number
  selling_price: number
  quantity_in_stock: number
  min_stock_level: number
  image_url: string | null
  categories: { name: string } | null
}

interface InventoryTableProps {
  items: InventoryItem[]
}

export function InventoryTable({ items }: InventoryTableProps) {
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null)

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity_in_stock === 0) {
      return { label: "Out of Stock", variant: "destructive" as const }
    } else if (item.quantity_in_stock <= item.min_stock_level) {
      return { label: "Low Stock", variant: "secondary" as const }
    }
    return { label: "In Stock", variant: "default" as const }
  }

  const calculateProfit = (item: InventoryItem) => {
    const profit = item.selling_price - item.cost_price
    const margin = ((profit / item.selling_price) * 100).toFixed(1)
    return { profit, margin }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No items found</h3>
        <p className="text-muted-foreground mb-4">Get started by adding your first inventory item.</p>
        <Link href="/inventory/add">
          <Button>Add Your First Item</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Cost Price</TableHead>
              <TableHead>Selling Price</TableHead>
              <TableHead>Profit Margin</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const stockStatus = getStockStatus(item)
              const { profit, margin } = calculateProfit(item)

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {item.image_url ? (
                        <img
                          src={item.image_url || "/placeholder.svg"}
                          alt={item.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-muted-foreground">
                            {item.description.length > 50
                              ? `${item.description.substring(0, 50)}...`
                              : item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{item.sku || "—"}</TableCell>
                  <TableCell>{item.categories?.name || "Uncategorized"}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{item.quantity_in_stock}</div>
                      <div className="text-muted-foreground">Min: {item.min_stock_level}</div>
                    </div>
                  </TableCell>
                  <TableCell>${item.cost_price.toFixed(2)}</TableCell>
                  <TableCell>${item.selling_price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className={profit >= 0 ? "text-green-600" : "text-red-600"}>${profit.toFixed(2)}</div>
                      <div className="text-muted-foreground">{margin}%</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/inventory/edit/${item.id}`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteItem(item)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <DeleteItemDialog item={deleteItem} open={!!deleteItem} onClose={() => setDeleteItem(null)} />
    </>
  )
}
