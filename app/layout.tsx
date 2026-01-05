import type { Metadata } from "next"
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter"
import { ThemeRegistry } from "@/theme/ThemeRegistry"

export const metadata: Metadata = {
  title: "Kotipelien toimitsijat",
  description: "Hallitse kotipelien toimitsijat helposti",
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
          <ThemeRegistry>{children}</ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
