"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Package, Clock } from "lucide-react"

interface Transaction {
  id: string
  transaction_type: string
  quantity: number
  total_amount: number
  customer_name?: string
  created_at: string
  inventory_items?: {
    name: string
    image_url?: string
  }
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Transactions
          </CardTitle>
          <CardDescription>Latest sales and inventory movements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No transactions found for this period</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Transactions
        </CardTitle>
        <CardDescription>Latest sales and inventory movements</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {transaction.inventory_items?.image_url ? (
                      <img
                        src={transaction.inventory_items.image_url || "/placeholder.svg"}
                        alt={transaction.inventory_items.name}
                        className="h-8 w-8 rounded object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                        <Package className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="text-sm font-medium">{transaction.inventory_items?.name || "Unknown"}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={transaction.transaction_type === "sale" ? "default" : "secondary"}>
                    {transaction.transaction_type}
                  </Badge>
                </TableCell>
                <TableCell>{transaction.quantity}</TableCell>
                <TableCell className="font-medium">${transaction.total_amount.toFixed(2)}</TableCell>
                <TableCell>{transaction.customer_name || "—"}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
