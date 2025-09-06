"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface SalesData {
  month: string
  total_sales: number
  total_revenue: number
}

interface SalesChartProps {
  data: SalesData[]
}

export function SalesChart({ data }: SalesChartProps) {
  const chartData = data.map((item) => ({
    month: new Date(item.month).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    sales: item.total_sales || 0,
    revenue: item.total_revenue || 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Trend</CardTitle>
        <CardDescription>Monthly sales volume and revenue trends</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              formatter={(value: number, name: string) => [
                name === "sales" ? `${value} sales` : `$${value.toFixed(2)}`,
                name === "sales" ? "Sales Count" : "Revenue",
              ]}
            />
            <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} name="Sales Count" />
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} name="Revenue" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
