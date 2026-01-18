import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter"
import { ThemeRegistry } from "@/theme/ThemeRegistry"
import { Providers } from "@/components/providers"
import { TeamProvider } from "@/components/team-context"
import { AuthProvider } from "@/components/auth-context"
import "./globals.css"

export const metadata: Metadata = {
  title: "Kotipelien toimitsijat",
  description: "Hallitse kotipelien toimitsijat helposti",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fi">
      <body>
        <AppRouterCacheProvider>
          <ThemeRegistry>
            <Providers>
              <AuthProvider>
                <Suspense>
                  <TeamProvider>{children}</TeamProvider>
                </Suspense>
              </AuthProvider>
            </Providers>
          </ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
