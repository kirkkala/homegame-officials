import "./globals.css"
import { Providers } from "@/components/providers"
import { TeamProvider } from "@/components/team-context"
import { ThemeRegistry } from "@/theme/ThemeRegistry"
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter"
import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Kotipelien toimitsijat",
  description: "Hallitse kotipelien toimitsijat helposti",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
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
              <Suspense>
                <TeamProvider>{children}</TeamProvider>
              </Suspense>
            </Providers>
          </ThemeRegistry>
        </AppRouterCacheProvider>
        <Analytics />
      </body>
    </html>
  )
}
