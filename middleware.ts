import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  // Get the pathname
  const pathname = request.nextUrl.pathname

  // If we have a response from updateSession, it means there's a user
  // We need to check their role and redirect appropriately
  if (response.status === 200) {
    // Allow the request to continue for now
    // Role-based redirects are handled in individual pages
    return response
  }

  // Handle authentication redirects
  if (
    pathname !== "/" &&
    !pathname.startsWith("/auth") &&
    response.status === 307 // Redirect status from updateSession
  ) {
    return response
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
