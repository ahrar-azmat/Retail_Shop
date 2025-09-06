"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Package } from "lucide-react"

interface InventoryItem {
  id: string
  name: string
  description: string | null
  sku: string | null
  quantity_in_stock: number
  min_stock_level: number
  image_url: string | null
  categories: { name: string } | null
}

interface ClientInventoryTableProps {
  items: InventoryItem[]
}

export function ClientInventoryTable({ items }: ClientInventoryTableProps) {
  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity_in_stock === 0) {
      return { label: "Out of Stock", variant: "destructive" as const }
    } else if (item.quantity_in_stock <= item.min_stock_level) {
      return { label: "Low Stock", variant: "secondary" as const }
    }
    return { label: "In Stock", variant: "default" as const }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No items found</h3>
        <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Current Stock</TableHead>
            <TableHead>Min Stock</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const stockStatus = getStockStatus(item)

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
                          {item.description.length > 50 ? `${item.description.substring(0, 50)}...` : item.description}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{item.sku || "—"}</TableCell>
                <TableCell>{item.categories?.name || "Uncategorized"}</TableCell>
                <TableCell>
                  <div className="text-sm font-medium">{item.quantity_in_stock}</div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-muted-foreground">{item.min_stock_level}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
