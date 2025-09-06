import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, BarChart3, Camera, Users, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <Store className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">RetailPro</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-foreground mb-6 text-balance">
            Professional Inventory Management for Retail Success
          </h2>
          <p className="text-xl text-muted-foreground mb-8 text-pretty">
            Take control of your retail business with powerful inventory tracking, profit analysis, and seamless
            photo-based stock management.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Everything You Need to Manage Your Retail Business
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From inventory tracking to profit analysis, RetailPro provides all the tools you need to run a successful
            retail operation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="bg-primary/10 text-primary p-3 rounded-lg w-fit">
                <Camera className="h-6 w-6" />
              </div>
              <CardTitle>Photo-Based Inventory</CardTitle>
              <CardDescription>
                Snap photos of your products and instantly add them to your inventory with cost and selling prices.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="bg-accent/10 text-accent p-3 rounded-lg w-fit">
                <BarChart3 className="h-6 w-6" />
              </div>
              <CardTitle>Profit & Loss Tracking</CardTitle>
              <CardDescription>
                Real-time P&L reports with detailed insights into your business performance and profitability.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="bg-blue-500/10 text-blue-600 p-3 rounded-lg w-fit">
                <Users className="h-6 w-6" />
              </div>
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>
                Separate owner and client access levels to keep your business data secure while enabling team
                collaboration.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="bg-orange-500/10 text-orange-600 p-3 rounded-lg w-fit">
                <TrendingUp className="h-6 w-6" />
              </div>
              <CardTitle>Sales Analytics</CardTitle>
              <CardDescription>
                Track sales trends, identify top-performing products, and make data-driven business decisions.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="bg-purple-500/10 text-purple-600 p-3 rounded-lg w-fit">
                <Store className="h-6 w-6" />
              </div>
              <CardTitle>Multi-Store Support</CardTitle>
              <CardDescription>
                Manage multiple retail locations from a single dashboard with consolidated reporting and analytics.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <div className="bg-green-500/10 text-green-600 p-3 rounded-lg w-fit">
                <Shield className="h-6 w-6" />
              </div>
              <CardTitle>Secure & Reliable</CardTitle>
              <CardDescription>
                Enterprise-grade security with automatic backups and 99.9% uptime to keep your business running
                smoothly.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Retail Business?</h3>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of retail professionals who trust RetailPro to manage their inventory and maximize their
            profits.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Start Your Free Trial Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Store className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">RetailPro</span>
          </div>
          <p className="text-muted-foreground">© 2024 RetailPro. Professional inventory management made simple.</p>
        </div>
      </footer>
    </div>
  )
}
