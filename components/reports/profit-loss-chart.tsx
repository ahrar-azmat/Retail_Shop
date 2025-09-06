"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface ProfitLossData {
  month: string
  total_revenue: number
  total_cost: number
  gross_profit: number
}

interface ProfitLossChartProps {
  data: ProfitLossData[]
}

export function ProfitLossChart({ data }: ProfitLossChartProps) {
  const chartData = data.map((item) => ({
    month: new Date(item.month).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    revenue: item.total_revenue || 0,
    costs: item.total_cost || 0,
    profit: item.gross_profit || 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit & Loss Overview</CardTitle>
        <CardDescription>Monthly revenue, costs, and profit comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value: number, name: string) => [
                `$${value.toFixed(2)}`,
                name === "revenue" ? "Revenue" : name === "costs" ? "Costs" : "Profit",
              ]}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
            <Bar dataKey="costs" fill="#ef4444" name="Costs" />
            <Bar dataKey="profit" fill="#3b82f6" name="Profit" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
