import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-destructive text-destructive-foreground p-3 rounded-full">
                <AlertCircle className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-2xl">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {params?.error ? (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">Error: {params.error}</div>
            ) : (
              <p className="text-sm text-muted-foreground">An authentication error occurred. Please try again.</p>
            )}
            <p className="text-sm">
              <Link href="/auth/login" className="text-primary hover:underline font-medium">
                Return to login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
